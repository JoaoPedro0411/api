const { validationResult } = require('express-validator');
const TransactionService = require('../services/transactionService');

class TransactionController {

    async createTransaction(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } 

        try {
            const newTransaction = await TransactionService.createTransaction(req.body);
            return res.status(201).json(newTransaction);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao criar transação' });
        }
    }

    async findTransaction(req, res) {
        try {
            const transaction = await TransactionService.findTransactionById(req.params.id);
            if (!transaction) {
                return res.status(404).json({ error: 'Transação não encontrada' });
            }
            return res.status(200).json(transaction);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao obter transação' });
        }
    }

    async updateTransaction(req, res) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const [updated] = await TransactionService.updateTransaction(req.params.id, req.body);
            if (!updated) {
                return res.status(404).json({ error: 'Transação não encontrada' });
            }
            return res.status(200).json({ message: 'Transação atualizada com sucesso' });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao atualizar transação' });
        }
    }

    async deleteTransaction(req, res) {
        try {
            const deleted = await TransactionService.deleteTransaction(req.params.id);
            if (!deleted) {
                return res.status(404).json({ error: 'Transação não encontrada' });
            }
            return res.status(204).send();
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao deletar transação' });
        }
    }
}

module.exports = new TransactionController();
