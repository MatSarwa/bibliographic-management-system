const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Workspace = sequelize.define('Workspace', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {  
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    settings: {
      type: DataTypes.JSONB,
      defaultValue: { color: '#6366f1' }
    }
  }, {
    tableName: 'workspaces',
    timestamps: true,
    underscored: true
  });

  Workspace.associate = (models) => {
    Workspace.belongsTo(models.User, {
      foreignKey: 'createdBy', 
      as: 'creator'  
    });

    Workspace.hasMany(models.WorkspaceMember, {
      foreignKey: 'workspaceId',
      as: 'members'
    });

    Workspace.hasMany(models.Collection, {
      foreignKey: 'workspaceId',
      as: 'collections'
    });
  };

  return Workspace;
};