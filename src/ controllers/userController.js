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

    async findUser(req, res) {
        try {
            const user = await UserService.findUserById(req.params.userId);
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' });
            }
            return res.status(200).json(user);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter usuário' });
        }
    }

    async updateUser(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const updatedUser = await UserService.updateUser(req.params.id, req.body);
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
            const deleted = await UserService.deleteUser(req.params.id);
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
