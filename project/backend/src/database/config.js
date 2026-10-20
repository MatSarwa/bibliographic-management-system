require('dotenv').config();

const config = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: console.log
  },
  // Hosted databases (Neon, Render) give a single connection string and require SSL.
  production: {
    use_env_variable: 'DATABASE_URL',
    dialect: 'postgres',
    dialectOptions: {
      ssl: { require: true, rejectUnauthorized: false }
    },
    logging: false
  },
  test: {
    dialect: 'sqlite',  
    storage: ':memory:',  
    logging: false  
  }
};

module.exports = config;