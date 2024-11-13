const express = require('express');
const { body, param } = require('express-validator');
const UserController = require('../controllers/userController')

const router = express.Router();


router.post(
    '/register',
    [
        body('userName').isString().withMessage('Nome deve ser uma string').notEmpty().withMessage('Nome é obrigatório'),
        body('userEmail').isEmail().withMessage('Email inválido').notEmpty().withMessage('Email é obrigatório'),
        body('userPassword').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres')
    ],
    UserController.createUser, 
);

router.get(
    '/:userId',
    [
        param('userId').isInt().withMessage('ID deve ser um número inteiro')
    ],
    UserController.getUser
);

router.put(
    '/:userId',
    [
        param('userId').isInt().withMessage('ID deve ser um número inteiro'),
        // body('userName').optional().isString().withMessage('Nome deve ser uma string'),
        // body('userEmail').optional().isEmail().withMessage('Email inválido')
    ],
    UserController.updateUser
);

router.delete(
    '/:userId',
    [
        param('userId').isInt().withMessage('ID deve ser um número inteiro')
    ],
    UserController.deleteUser
);


module.exports = router;
