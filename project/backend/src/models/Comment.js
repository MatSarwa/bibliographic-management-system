const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Comment = sequelize.define('Comment', {
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
    userId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'comments',
        key: 'id'
      }
    },
    isResolved: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'comments',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['item_id'] },
      { fields: ['user_id'] },
      { fields: ['parent_id'] }
    ]
  });

  Comment.associate = (models) => {
    Comment.belongsTo(models.Item, {
      foreignKey: 'itemId',
      as: 'item',
      onDelete: 'CASCADE'
    });

    Comment.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'SET NULL'
    });

    Comment.belongsTo(models.Comment, {
      foreignKey: 'parentId',
      as: 'parent',
      onDelete: 'CASCADE'
    });

    Comment.hasMany(models.Comment, {
      foreignKey: 'parentId',
      as: 'replies',
      onDelete: 'CASCADE'
    });
  };

  return Comment;
};