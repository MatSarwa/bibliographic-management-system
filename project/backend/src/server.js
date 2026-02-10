const app = require('./app');
const config = require('./shared/config/environment');
const { sequelize } = require('./models');

const PORT = config.port;

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully');
    console.log('Database:', config.database.name);
    
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
      console.log('Environment:', config.env);
      console.log('Health: http://localhost:' + PORT + '/health');
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    console.error('Check PostgreSQL and .env credentials');
    process.exit(1);
  });