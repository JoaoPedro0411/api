const { Sequelize } = require("sequelize");


const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  dialect: process.env.DB_DIALECT,
  host: process.env.DB_HOST,
});

const init = () => {
  sequelize
    .sync({ alter: true })
    .then(() => {
      console.log("Banco de dados sincronizado com sucesso");
    })
    .catch((error) => {
      console.error("Erro ao sincronizar o banco de dados", error);
    });
};

const connect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexão estabelecida com sucesso");
  } catch (error) {
    console.error("Erro ao conectar com o banco de dados", error);
  }
};

module.exports = {
  sequelize,
  init,
  connect,
};
const User = require("../models/user");
const UserAssets = require("../models/user-assets");
const Transaction = require("../models/transaction");

User.hasMany(UserAssets, { foreignKey: "user_id" });
User.hasMany(Transaction, { foreignKey: "user_id" });
UserAssets.belongsTo(User, { foreignKey: "user_id" });
Transaction.belongsTo(User, { foreignKey: "user_id" });
