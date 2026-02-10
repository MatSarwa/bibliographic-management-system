const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const CollectionMember = sequelize.define('CollectionMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    collectionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'collections',
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    joinedAt: { 
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }

  }, {
    tableName: 'collection_members',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['collection_id', 'user_id']
      },
      {
        fields: ['user_id']
      }
    ]
  });

  CollectionMember.associate = (models) => {
    CollectionMember.belongsTo(models.Collection, {
      foreignKey: 'collectionId',
      as: 'collection',
      onDelete: 'CASCADE'
    });

    CollectionMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });

  };

  return CollectionMember;
};