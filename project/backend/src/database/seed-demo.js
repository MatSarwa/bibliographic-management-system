// Creates a shared, verified demo account with the sample library, for local development
// and for logging in with known credentials. (On the website, "Try demo" creates a separate
// temporary account per visitor instead – see src/features/auth/demo.)
// Usage: npm run seed:demo            – create the demo account if it does not exist
//        npm run seed:demo -- --reset – wipe the demo account and recreate it
// Credentials can be overridden with DEMO_EMAIL / DEMO_PASSWORD.
const bcrypt = require('bcrypt');
const { sequelize, User } = require('../models');
const { createDemoContent, deleteUserWithData } = require('../features/auth/demo/demo-content');
const { SHARED_DEMO_EMAIL } = require('../features/auth/demo/demo-accounts');

const RESET = process.argv.includes('--reset');
const DEMO_USERNAME = process.env.DEMO_USERNAME || 'demo';
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || 'Demo1234!';

async function seedDemo() {
  const existing = await User.findOne({ where: { email: SHARED_DEMO_EMAIL } });
  if (existing && !RESET) {
    console.log(`Konto demo ${SHARED_DEMO_EMAIL} już istnieje – pomijam. Użyj --reset, żeby je odtworzyć.`);
    return;
  }

  await sequelize.transaction(async (transaction) => {
    if (existing) {
      await deleteUserWithData(existing, transaction);
      console.log('Usunięto stare konto demo.');
    }

    const user = await User.create({
      username: DEMO_USERNAME,
      email: SHARED_DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      isVerified: true,
    }, { transaction });

    await createDemoContent(user, transaction);
  });

  console.log('Konto demo utworzone:');
  console.log(`  email: ${SHARED_DEMO_EMAIL}`);
  console.log(`  hasło: ${DEMO_PASSWORD}`);
}

seedDemo()
  .catch((err) => {
    console.error('Nie udało się utworzyć konta demo:', err.message);
    process.exitCode = 1;
  })
  .finally(() => sequelize.close());
