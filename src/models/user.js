const sequelize = require("../config/db-config").sequelize; 
const { Model, DataTypes } = require("sequelize");

class User extends Model {}

User.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      field:"user_id",
    },
    userName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "user_name",
    },
    userEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      field: "user_email",
      validate: {
        isEmail: true,
      },
    },
    userBalance: {
      type: DataTypes.DECIMAL,
      allowNull: false,
      field: "user_balance",
    },
    userPassword:{
      type:DataTypes.STRING,
      allowNull:true,
      field:'user_password'
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "user_accounts",
  }
);
module.exports = User;
