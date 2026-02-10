const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define('Item', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'collections',
        key: 'id'
      }
    },
    title: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    itemType: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'article'
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING(50),
      defaultValue: 'active',
      validate: {
        isIn: [['active', 'trashed']]
      }
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deletedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    dateAdded: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'items',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id', 'status'] },
      { fields: ['collection_id', 'status'] },
      { fields: ['status', 'deleted_at'] },
      { fields: ['item_type'] },
      { fields: ['year'] },
      { fields: ['favorite'] },
      { fields: ['date_added'] }
    ]
  });

  Item.associate = (models) => {
    Item.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });

    Item.belongsTo(models.Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
      onDelete: 'RESTRICT'
    });

    Item.belongsTo(models.User, {
      foreignKey: 'deletedBy',
      as: 'deleter',
      onDelete: 'SET NULL'
    });

    Item.belongsToMany(models.Label, {
      through: models.ItemLabel,
      foreignKey: 'itemId',
      otherKey: 'labelId',
      as: 'labels'
    });

    Item.hasMany(models.ItemLabel, {
      foreignKey: 'itemId',
      as: 'itemLabels',
      onDelete: 'CASCADE'
    });

    Item.hasMany(models.Comment, {
      foreignKey: 'itemId',
      as: 'comments',
      onDelete: 'CASCADE'
    });

    Item.hasMany(models.ItemHistory, {
      foreignKey: 'itemId',
      as: 'history',
      onDelete: 'CASCADE'
    });
  };

  return Item;
};