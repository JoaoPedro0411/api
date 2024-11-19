const sequelize = require("../config/db-config").sequelize; 
const { Model, DataTypes } = require("sequelize");
const User = require("./user");

class Transaction extends Model {}

Transaction.init(
  {
    transactionAssetTicker: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "transaction_asset_ticker",
    },
    transactionId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field: "transaction_id",
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
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      field: "transaction_date",
    },
    transactionCost: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: "transaction_cost",
    },
    transactionType: {
      type: DataTypes.ENUM("buy", "sell"),
      allowNull: false,
      field: "transaction_type",
    },
    transactionAssetQuantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "transaction_asset_quantity",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: "is_active",
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
  }
);

module.exports = Transaction;
