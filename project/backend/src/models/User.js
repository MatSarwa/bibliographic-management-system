const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: true 
    },
    googleId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      unique: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verificationToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true
    },
    resetPasswordToken: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    resetPasswordExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true 
  });

  User.associate = (models) => {

    User.hasMany(models.Workspace, {

      foreignKey: 'createdBy',
      as: 'createdWorkspaces',
      onDelete: 'CASCADE'
    });

    User.belongsToMany(models.Workspace, {
      through: models.WorkspaceMember,
      foreignKey: 'userId',
      otherKey: 'workspaceId',
      as: 'workspaces'
    });

    User.hasMany(models.Collection, {
      foreignKey: 'ownerId',
      as: 'ownedCollections',
      onDelete: 'CASCADE'
    });

    User.belongsToMany(models.Collection, {
      through: models.CollectionMember,
      foreignKey: 'userId',
      otherKey: 'collectionId',
      as: 'collections'
    });

    User.hasMany(models.Item, {
      foreignKey: 'userId',
      as: 'items',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.Label, {
      foreignKey: 'userId',
      as: 'labels',
      onDelete: 'CASCADE'
    });

    User.hasMany(models.Comment, {
      foreignKey: 'userId',
      as: 'comments',
      onDelete: 'SET NULL'
    });

    User.hasMany(models.ItemHistory, {
      foreignKey: 'changedBy',
      as: 'changeHistory',
      onDelete: 'SET NULL'
    });
  };

  return User;
};