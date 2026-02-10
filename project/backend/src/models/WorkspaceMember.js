const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const WorkspaceMember = sequelize.define('WorkspaceMember', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    workspaceId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'workspaces',
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
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'viewer',
      validate: {
        isIn: [['admin', 'editor', 'viewer']]  
      }
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      allowNull: false
    }
  }, {
    tableName: 'workspace_members',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['workspace_id', 'user_id']
      },
      {
        fields: ['user_id']
      }
    ]
  });

  WorkspaceMember.associate = (models) => {
    WorkspaceMember.belongsTo(models.Workspace, {
      foreignKey: 'workspaceId',
      as: 'workspace',
      onDelete: 'CASCADE'
    });

    WorkspaceMember.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });
  };

  return WorkspaceMember;
};