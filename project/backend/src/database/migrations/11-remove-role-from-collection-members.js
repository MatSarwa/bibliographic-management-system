'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('collection_members', 'role');
    console.log('Usunięto kolumnę "role" z collection_members');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('collection_members', 'role', {
      type: Sequelize.STRING(50),
      allowNull: true
    });
  }
};