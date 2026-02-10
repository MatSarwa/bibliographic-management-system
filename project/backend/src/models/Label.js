const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Label = sequelize.define('Label', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    color: {
      type: DataTypes.STRING(50),
      defaultValue: '#9E9E9E'
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'labels',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'user_id']
      },
      {
        fields: ['user_id']
      }
    ]
  });

  Label.associate = (models) => {
    Label.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE'
    });

    Label.belongsToMany(models.Item, {
      through: models.ItemLabel,
      foreignKey: 'labelId',
      otherKey: 'itemId',
      as: 'items'
    });

    Label.hasMany(models.ItemLabel, {
      foreignKey: 'labelId',
      as: 'itemLabels',
      onDelete: 'CASCADE'
    });
  };

  return Label;
};