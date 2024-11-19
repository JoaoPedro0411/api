const { validationResult } = require("express-validator");
const UserService = require("../services/userService");

class UserController {
  async createUser(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const newUser = await UserService.createUser(req.body);
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar usuário" });
    }
  }

  async deposit(req, res) {
    const { userId } = req.params;
    const { amount } = req.body;

    try {
      const result = await UserService.deposit(userId, amount);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao adicionar saldo:", error.message);
      return res.status(500).json({ error: "Erro ao adicionar saldo" });
    }
  }

  async withdraw(req, res) {
    const { userId } = req.params;
    const { amount } = req.body;

    try {
      const result = await UserService.withdraw(userId, amount);
      return res.status(200).json(result);
    } catch (error) {
      console.error("Erro ao remover saldo:", error.message);
      return res.status(500).json({ error: "Erro ao remover saldo" });
    }
  }
}

module.exports = new UserController();
