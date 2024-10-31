const sequelize = require("../config/db-config").sequelize; 
const { Model, DataTypes } = require("sequelize");
const User = require("./user");

class UserAssets extends Model {}

UserAssets.init(
  {
    assetId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "asset_id",
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
      field: "user_id",
    },
    assetValue: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: "asset_value",
    },
    assetName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "asset_name",
    },
    assetType: {
      type: DataTypes.ENUM("Stock", "REIT"),
      allowNull: false,
      field: "asset_type",
    },
  },
  {
    sequelize,
    modelName: "UserAssets",
    tableName: "user_assets",
  }
);

module.exports = UserAssets;
