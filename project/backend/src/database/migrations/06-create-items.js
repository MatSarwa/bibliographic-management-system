'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
        primaryKey: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      collection_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'collections',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      item_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'article'
      },
      metadata: {
        type: Sequelize.JSONB,
        defaultValue: {}
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'active'
      },
      favorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_by: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      date_added: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('items', ['user_id', 'status']);
    await queryInterface.addIndex('items', ['collection_id', 'status']);
    await queryInterface.addIndex('items', ['status', 'deleted_at']);
    await queryInterface.addIndex('items', ['item_type']);
    await queryInterface.addIndex('items', ['year']);
    await queryInterface.addIndex('items', ['favorite']);
    await queryInterface.addIndex('items', ['date_added']);
    
    await queryInterface.sequelize.query(
      "CREATE INDEX items_metadata_gin ON items USING GIN (metadata);"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('items');
  }
};