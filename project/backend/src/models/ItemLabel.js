const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemLabel = sequelize.define('ItemLabel', {
    itemId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'items',
        key: 'id'
      }
    },
    labelId: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'labels',
        key: 'id'
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'item_labels',
    timestamps: false,
    underscored: true,
    indexes: [
      {
        fields: ['label_id']
      }
    ]
  });

  ItemLabel.associate = (models) => {
    ItemLabel.belongsTo(models.Item, {
      foreignKey: 'itemId',
      as: 'item',
      onDelete: 'CASCADE'
    });

    ItemLabel.belongsTo(models.Label, {
      foreignKey: 'labelId',
      as: 'label',
      onDelete: 'CASCADE'
    });
  };

  return ItemLabel;
};