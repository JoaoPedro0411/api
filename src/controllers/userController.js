const { validationResult } = require('express-validator');
const UserService = require('../services/userService');

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
            return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
    }

    async getUser(req, res) {
        try {
          const user = await UserService.getUserById(req.params.userId);
          if (!user) {
            return res.status(404).json({ error: "Usuário não encontrado" });
          }
      
          const data = {
            userId: user.userId,
            userName: user.userName,
            userEmail: user.userEmail,
            userBalance: user.userBalance,
          };
      
          return res.status(200).json(data);
        } catch (error) {
          console.error("Erro ao obter usuário:", error.message);
          return res.status(500).json({ error: "Erro ao obter usuário", details: error.message });
        }
      }

    async updateUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedUser = await UserService.updateUser(req.params.userId, req.body);
            if (!updatedUser) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(200).json({ message: 'Usuário atualizado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar usuário' });
        }
    }

    async deleteUser(req, res) {
        try {
            const deleted = await UserService.deleteUser(req.params.userId);
            if (!deleted) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
}

module.exports = new UserController();
