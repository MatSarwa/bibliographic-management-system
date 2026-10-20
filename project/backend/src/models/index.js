const { Sequelize } = require('sequelize');
const config = require('../database/config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

if (!dbConfig) {
  throw new Error(`Brak konfiguracji dla środowiska: ${env}. Dodaj sekcję '${env}' do config.js.`);
}

const sequelize = dbConfig.use_env_variable
  ? new Sequelize(process.env[dbConfig.use_env_variable], dbConfig)
  : new Sequelize(
    dbConfig.database,
    dbConfig.username,
    dbConfig.password,
    {
      host: dbConfig.host,
      port: dbConfig.port,
      dialect: dbConfig.dialect,
      logging: dbConfig.logging,
      storage: dbConfig.storage
    }
  );

const db = { sequelize, Sequelize };

db.User = require('./User')(sequelize);
db.Workspace = require('./Workspace')(sequelize);
db.WorkspaceMember = require('./WorkspaceMember')(sequelize);
db.Collection = require('./Collection')(sequelize);
db.CollectionMember = require('./CollectionMember')(sequelize);
db.Item = require('./Item')(sequelize);
db.Label = require('./Label')(sequelize);
db.ItemLabel = require('./ItemLabel')(sequelize);
db.Comment = require('./Comment')(sequelize);
db.ItemHistory = require('./ItemHistory')(sequelize);

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;