const { validationResult } = require('express-validator');
const UserAssetsService = require('../services/userAssetsService');

class UserController {

    async createUserAsset(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newUser = await UserAssetsService.createUserAsset(req.body);
            return res.status(201).json(newUserAsset);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar Ativo' });
        }
    }

    async findUserAsset(req, res) {
        try {
            const userAsset = await UserAssetsService.findUserAssetById(req.params.id);
            if (!userAsset) {
                return res.status(404).json({ error: 'Ativo não encontrado' });
            }
            return res.status(200).json(userAsset);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter Ativo' });
        }
    }

    async updateUserAsset(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const [updated] = await UserAssetsService.updateUserAsset(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Ativo não encontrado' });
            }
            return res.status(200).json({ message: 'Ativo atualizado com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar Ativo' });
        }
    }

    async deleteAsset(req, res) {
        try {
            const deleted = await UserAssetsService.deleteAsset(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Ativo não encontrado' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar Ativo' });
        }
    }
}

module.exports = new UserController();
