// Creates a verified demo account with sample collections, labels and items,
// so the app can be tried without registering or receiving an email.
// Usage: npm run seed:demo            – create the demo account if it does not exist
//        npm run seed:demo -- --reset – wipe the demo account (e.g. after visitors changed it) and recreate it
// Credentials can be overridden with DEMO_EMAIL / DEMO_PASSWORD.
const bcrypt = require('bcrypt');
const { sequelize, User, Collection, Label, Item, ItemLabel } = require('../models');

const RESET = process.argv.includes('--reset');

const DEMO_EMAIL = process.env.DEMO_EMAIL || 'demo@example.com';
const DEMO_USERNAME = process.env.DEMO_USERNAME || 'demo';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo1234!';

const LABELS = [
  { key: 'ai', name: 'AI', color: '#8b5cf6' },
  { key: 'classic', name: 'Klasyka', color: '#f59e0b' },
  { key: 'testing', name: 'Testowanie', color: '#10b981' },
  { key: 'toRead', name: 'Do przeczytania', color: '#3b82f6' },
];

const ITEMS = [
  {
    collection: 'ml',
    labels: ['ai', 'classic'],
    favorite: true,
    title: 'Attention Is All You Need',
    itemType: 'conference',
    year: 2017,
    metadata: {
      authors: ['Ashish Vaswani', 'Noam Shazeer', 'Niki Parmar', 'Jakob Uszkoreit', 'Llion Jones', 'Aidan N. Gomez', 'Łukasz Kaiser', 'Illia Polosukhin'],
      booktitle: 'Advances in Neural Information Processing Systems 30 (NeurIPS 2017)',
      url: 'https://arxiv.org/abs/1706.03762',
    },
  },
  {
    collection: 'ml',
    labels: ['ai'],
    title: 'Deep Residual Learning for Image Recognition',
    itemType: 'conference',
    year: 2016,
    metadata: {
      authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
      booktitle: 'Proceedings of the IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
      pages: '770-778',
      doi: '10.1109/CVPR.2016.90',
    },
  },
  {
    collection: 'ml',
    labels: ['ai', 'toRead'],
    title: 'BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding',
    itemType: 'conference',
    year: 2019,
    metadata: {
      authors: ['Jacob Devlin', 'Ming-Wei Chang', 'Kenton Lee', 'Kristina Toutanova'],
      booktitle: 'Proceedings of NAACL-HLT 2019',
      pages: '4171-4186',
      url: 'https://arxiv.org/abs/1810.04805',
    },
  },
  {
    collection: 'ml',
    labels: ['ai'],
    title: 'Mastering the game of Go with deep neural networks and tree search',
    itemType: 'article',
    year: 2016,
    metadata: {
      authors: ['David Silver', 'Aja Huang', 'Chris J. Maddison', 'Arthur Guez'],
      journal: 'Nature',
      volume: '529',
      pages: '484-489',
      doi: '10.1038/nature16961',
    },
  },
  {
    collection: 'classics',
    labels: ['classic'],
    favorite: true,
    title: 'A Mathematical Theory of Communication',
    itemType: 'article',
    year: 1948,
    metadata: {
      authors: ['Claude E. Shannon'],
      journal: 'Bell System Technical Journal',
      volume: '27',
      issue: '3',
      pages: '379-423',
      doi: '10.1002/j.1538-7305.1948.tb01338.x',
    },
  },
  {
    collection: 'engineering',
    labels: ['classic'],
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    itemType: 'book',
    year: 2008,
    metadata: {
      authors: ['Robert C. Martin'],
      publisher: 'Prentice Hall',
      isbn: '9780132350884',
    },
  },
  {
    collection: 'engineering',
    labels: ['toRead'],
    title: 'The Pragmatic Programmer: From Journeyman to Master',
    itemType: 'book',
    year: 1999,
    metadata: {
      authors: ['Andrew Hunt', 'David Thomas'],
      publisher: 'Addison-Wesley',
      isbn: '9780201616224',
    },
  },
  {
    collection: 'testing',
    labels: ['testing'],
    favorite: true,
    title: 'Lessons Learned in Software Testing: A Context-Driven Approach',
    itemType: 'book',
    year: 2002,
    metadata: {
      authors: ['Cem Kaner', 'James Bach', 'Bret Pettichord'],
      publisher: 'Wiley',
      isbn: '9780471081128',
    },
  },
];

// Deletes in dependency order (items → labels → collections → user) so no foreign key blocks it.
async function deleteDemoAccount(user, transaction) {
  await Item.destroy({ where: { userId: user.id }, transaction });
  await Label.destroy({ where: { userId: user.id }, transaction });
  await Collection.update({ parentId: null }, { where: { ownerId: user.id }, transaction });
  await Collection.destroy({ where: { ownerId: user.id }, transaction });
  await user.destroy({ transaction });
}

async function seedDemo() {
  const existing = await User.findOne({ where: { email: DEMO_EMAIL } });
  if (existing && !RESET) {
    console.log(`Konto demo ${DEMO_EMAIL} już istnieje – pomijam. Użyj --reset, żeby je odtworzyć.`);
    return;
  }

  await sequelize.transaction(async (transaction) => {
    if (existing) {
      await deleteDemoAccount(existing, transaction);
      console.log('Usunięto stare konto demo.');
    }

    const user = await User.create({
      username: DEMO_USERNAME,
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      isVerified: true,
    }, { transaction });

    const research = await Collection.create(
      { name: 'Praca badawcza', ownerId: user.id, settings: { color: '#6366f1' } },
      { transaction }
    );
    const collections = {
      ml: await Collection.create({ name: 'Uczenie maszynowe', ownerId: user.id, parentId: research.id, settings: { color: '#8b5cf6' } }, { transaction }),
      classics: await Collection.create({ name: 'Klasyka informatyki', ownerId: user.id, parentId: research.id, settings: { color: '#f59e0b' } }, { transaction }),
      engineering: await Collection.create({ name: 'Inżynieria oprogramowania', ownerId: user.id, settings: { color: '#06b6d4' } }, { transaction }),
      testing: await Collection.create({ name: 'Testowanie', ownerId: user.id, settings: { color: '#10b981' } }, { transaction }),
    };

    const labels = {};
    for (const { key, name, color } of LABELS) {
      labels[key] = await Label.create({ name, color, userId: user.id }, { transaction });
    }

    for (const { collection, labels: labelKeys, ...data } of ITEMS) {
      const item = await Item.create(
        { ...data, userId: user.id, collectionId: collections[collection].id },
        { transaction }
      );
      await ItemLabel.bulkCreate(
        labelKeys.map((key) => ({ itemId: item.id, labelId: labels[key].id })),
        { transaction }
      );
    }
  });

  console.log('Konto demo utworzone:');
  console.log(`  email: ${DEMO_EMAIL}`);
  console.log(`  hasło: ${DEMO_PASSWORD}`);
}

seedDemo()
  .catch((err) => {
    console.error('Nie udało się utworzyć konta demo:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
