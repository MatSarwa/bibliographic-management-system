const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemHistory = sequelize.define('ItemHistory', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'workspaces',
        key: 'id'
      }
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    changedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    changeType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [['created', 'updated', 'deleted', 'restored', 'moved']]
      }
    },
    snapshot: {
      type: DataTypes.JSONB,
      allowNull: false
    },
    diff: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    changedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'item_history',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['item_id', 'version']
      },
      { fields: ['workspace_id'] },
      { fields: ['changed_by'] },
      { fields: ['changed_at'] }
    ]
  });

  ItemHistory.associate = (models) => {
    ItemHistory.belongsTo(models.Item, {
      foreignKey: 'itemId',
      as: 'item',
      onDelete: 'CASCADE'
    });

    ItemHistory.belongsTo(models.Workspace, {
      foreignKey: 'workspaceId',
      as: 'workspace',
      onDelete: 'SET NULL'
    });

    ItemHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'user',
      onDelete: 'SET NULL'
    });
  };

  return ItemHistory;
};