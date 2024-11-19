const { Error } = require("sequelize");
const { sequelize } = require("../config/db-config");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

class UserService {
  async createUser(data) {
    const transaction = await sequelize.transaction();

    try {
      const { userName, userEmail, userPassword } = data;

      const existingUser = await User.findOne({ where: { userEmail } });
      if (existingUser) {
        throw new Error("Email já cadastrado");
      }

      const hashedPassword = await bcrypt.hash(userPassword, 10);
      const token = jwt.sign({ userEmail }, SECRET_KEY, { expiresIn: "1h" });

      const newUser = await User.create(
        {
          userName,
          userEmail,
          userPassword: hashedPassword,
          userBalance: 0,
        },
        { transaction }
      );

      await transaction.commit();
      return { user: newUser, token };
    } catch (error) {
      await transaction.rollback();
      console.error("Erro ao criar usuário:", error.message);
      throw error;
    }
  }

  async getUserById(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      return user;
    } catch (error) {
      console.error(`Erro ao buscar usuário pelo ID: ${error.message}`);
      throw error;
    }
  }

  async updateUser(id, data) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      await user.update(data);
      return user;
    } catch (error) {
      console.error(`Erro ao atualizar usuário: ${error.message}`);
      throw error;
    }
  }

  async deleteUser(id) {
    try {
      const user = await User.findByPk(id);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      await User.destroy({ where: { userId: id } });
    } catch (error) {
      console.error(`Erro ao deletar usuário: ${error.message}`);
      throw error;
    }
  }

  async deposit(userId, amount) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      const newBalance = user.userBalance + amount;
      await user.update({ userBalance: newBalance });
      return { userId, newBalance };
    } catch (error) {
      console.error("Erro ao adicionar saldo:", error.message);
      throw error;
    }
  }

  async withdraw(userId, amount) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }
      if (user.userBalance < amount) {
        throw new Error("Saldo insuficiente");
      }
      const newBalance = user.userBalance - amount;
      await user.update({ userBalance: newBalance });
      return { userId, newBalance };
    } catch (error) {
      console.error("Erro ao remover saldo:", error.message);
      throw error;
    }
  }
}

module.exports = new UserService();
