// Sample library used for demo accounts: the shared one from `npm run seed:demo`
// and the temporary per-visitor ones from POST /api/auth/demo.
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const {
  User, Collection, Label, Item, ItemLabel, Workspace, WorkspaceMember, Comment, ItemHistory,
} = require('../../../models');

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

// Shared workspace: comments and version history only exist for workspace items, so the demo needs one.
const WORKSPACE_ITEMS = [
  {
    title: 'Language Models are Few-Shot Learners',
    itemType: 'conference',
    year: 2020,
    metadata: {
      authors: ['Tom B. Brown', 'Benjamin Mann', 'Nick Ryder', 'Melanie Subbiah'],
      booktitle: 'Advances in Neural Information Processing Systems 33 (NeurIPS 2020)',
      url: 'https://arxiv.org/abs/2005.14165',
    },
  },
  {
    title: 'Training language models to follow instructions with human feedback',
    itemType: 'conference',
    year: 2022,
    metadata: {
      authors: ['Long Ouyang', 'Jeff Wu', 'Xu Jiang', 'Diogo Almeida'],
      booktitle: 'Advances in Neural Information Processing Systems 35 (NeurIPS 2022)',
      url: 'https://arxiv.org/abs/2203.02155',
    },
  },
  {
    title: 'LLaMA: Open and Efficient Foundation Language Models',
    itemType: 'article',
    year: 2023,
    metadata: {
      authors: ['Hugo Touvron', 'Thibaut Lavril', 'Gautier Izacard', 'Xavier Martinet'],
      journal: 'arXiv preprint',
      url: 'https://arxiv.org/abs/2302.13971',
    },
  },
];

// The made-up colleague lives next to the demo user (same email domain), so the
// 24h cleanup of visitor demos removes both together.
function colleagueEmailFor(user) {
  const [local, domain] = user.email.split('@');
  return `${local}.anna@${domain}`;
}

async function createDemoWorkspace(user, transaction) {
  const colleague = await User.create({
    username: `anna.nowak-${user.id.slice(0, 6)}`,
    email: colleagueEmailFor(user),
    password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
    isVerified: true,
  }, { transaction });

  const workspace = await Workspace.create({
    name: 'Zespół badawczy',
    description: 'Wspólna literatura do artykułu o dużych modelach językowych',
    createdBy: user.id,
    settings: { color: '#8b5cf6' },
  }, { transaction });

  await WorkspaceMember.bulkCreate([
    { workspaceId: workspace.id, userId: user.id, role: 'admin' },
    { workspaceId: workspace.id, userId: colleague.id, role: 'editor' },
  ], { transaction });

  const collection = await Collection.create({
    name: 'Przegląd literatury – LLM',
    ownerId: null,
    workspaceId: workspace.id,
    isPublic: true,
    settings: { color: '#8b5cf6' },
  }, { transaction });

  const items = [];
  for (const data of WORKSPACE_ITEMS) {
    const item = await Item.create(
      { ...data, userId: user.id, collectionId: collection.id, status: 'active', dateAdded: new Date() },
      { transaction }
    );
    await ItemHistory.create({
      itemId: item.id, workspaceId: workspace.id, version: 1, changedBy: user.id,
      changeType: 'created', snapshot: item.toJSON(), diff: null,
    }, { transaction });
    items.push(item);
  }

  // Version 2 of the first item: the colleague added a note.
  const [gpt3, instructGpt] = items;
  const note = 'Kluczowe dla sekcji 2: wyniki few-shot bez dostrajania modelu.';
  const before = gpt3.toJSON();
  await gpt3.update({ notes: note, version: 2 }, { transaction });
  await ItemHistory.create({
    itemId: gpt3.id, workspaceId: workspace.id, version: 2, changedBy: colleague.id,
    changeType: 'updated', snapshot: gpt3.toJSON(), diff: { notes: { old: before.notes, new: note } },
  }, { transaction });

  const question = await Comment.create({
    itemId: gpt3.id, userId: colleague.id,
    content: 'Dodałam notatkę o wynikach few-shot – zerknij, czy pasuje do sekcji 2.',
  }, { transaction });
  await Comment.create({
    itemId: gpt3.id, userId: user.id, parentId: question.id,
    content: 'Pasuje idealnie, dzięki! Zacytuję to we wstępie.',
  }, { transaction });
  await Comment.create({
    itemId: instructGpt.id, userId: colleague.id, isResolved: true,
    content: 'Uzupełniłam link do arXiv – można zamknąć.',
  }, { transaction });
}

// Fills an (empty) account with the sample collections, labels, items and a shared workspace.
async function createDemoContent(user, transaction) {
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

  await createDemoWorkspace(user, transaction);
}

// Deletes a demo user with all their data and their made-up colleague, in dependency order
// (items → labels → collections → workspaces → users) so no foreign key blocks it.
async function deleteUserWithData(user, transaction) {
  await Item.destroy({ where: { userId: user.id }, transaction });
  await Label.destroy({ where: { userId: user.id }, transaction });
  await Collection.update({ parentId: null }, { where: { ownerId: user.id }, transaction });
  await Collection.destroy({ where: { ownerId: user.id }, transaction });

  const workspaceIds = (await Workspace.findAll({ where: { createdBy: user.id }, attributes: ['id'], transaction }))
    .map((ws) => ws.id);
  if (workspaceIds.length) {
    await Collection.destroy({ where: { workspaceId: workspaceIds }, transaction });
    await WorkspaceMember.destroy({ where: { workspaceId: workspaceIds }, transaction });
    await Workspace.destroy({ where: { id: workspaceIds }, transaction });
  }

  await User.destroy({ where: { email: colleagueEmailFor(user) }, transaction });
  await user.destroy({ transaction });
}

module.exports = { createDemoContent, deleteUserWithData };
