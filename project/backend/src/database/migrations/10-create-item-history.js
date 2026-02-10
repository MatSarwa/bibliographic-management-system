'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('item_history', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      item_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'items',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      workspace_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'workspaces',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      version: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      changed_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      change_type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      snapshot: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      diff: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      changed_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('item_history', ['item_id', 'version'], {
      unique: true,
      name: 'item_history_unique'
    });
    await queryInterface.addIndex('item_history', ['workspace_id']);
    await queryInterface.addIndex('item_history', ['changed_by']);
    await queryInterface.addIndex('item_history', ['changed_at']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('item_history');
  }
};