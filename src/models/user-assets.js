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
    assetTicker: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "asset_tick",
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
    assetPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: "asset_price",
    },
    averageAssetPrice: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      defaultValue: 0,
      field: "average_asset_price",
    },
    assetName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "asset_name",
    },
    assetType: {
      type: DataTypes.ENUM("stock", "fund"),
      allowNull: false,
      field: "asset_type",
    },
    assetLogoUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "asset_logo_url",
    },
    assetTotalQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "asset_total_quantity",
    },
  },
  {
    sequelize,
    modelName: "UserAssets",
    tableName: "user_assets",
  }
);

module.exports = UserAssets;
