const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Collection = sequelize.define('Collection', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'collections',
        key: 'id'
      }
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
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
    isPublic: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isSystemDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: { color: '#3B82F6' }
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'collections',
    timestamps: true,
    underscored: true,
    paranoid: true,
    indexes: [
      { fields: ['owner_id'] },
      { fields: ['workspace_id'] },
      { fields: ['is_public'] },
      { fields: ['parent_id'] },
      { fields: ['deleted_at'] }
    ]
  });

  Collection.associate = (models) => {
    Collection.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'owner',
      onDelete: 'CASCADE'
    });

    Collection.belongsTo(models.Workspace, {
      foreignKey: 'workspaceId',
      as: 'workspace',
      onDelete: 'CASCADE'
    });

    Collection.belongsTo(models.Collection, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'SET NULL'
    });

    Collection.hasMany(models.Collection, {
      foreignKey: 'parentId',
      as: 'children',
      onDelete: 'SET NULL'
    });

    Collection.belongsToMany(models.User, {
      through: models.CollectionMember,
      foreignKey: 'collectionId',
      otherKey: 'userId',
      as: 'members'
    });

    Collection.hasMany(models.CollectionMember, {
      foreignKey: 'collectionId',
      as: 'memberships',
      onDelete: 'CASCADE'
    });

    Collection.hasMany(models.Item, {
      foreignKey: 'collectionId',
      as: 'items',
      onDelete: 'RESTRICT'
    });
  };

  return Collection;
};