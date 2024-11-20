const express = require("express");
const { body, param, validationResult } = require("express-validator");
const UserController = require("../controllers/userController");

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post(
  "/register",
  [
    body("userName")
      .isString()
      .withMessage("Nome deve ser uma string")
      .notEmpty(),
    body("userEmail").isEmail().withMessage("Email inválido").notEmpty(),
    body("userPassword")
      .isLength({ min: 6 })
      .withMessage("Senha deve ter pelo menos 6 caracteres"),
    handleValidationErrors,
  ],
  UserController.createUser
);

router.get(
  "/:userId",
  [param("userId").isInt().withMessage("ID deve ser um número inteiro")],
  handleValidationErrors,
  UserController.getUser
);

router.put(
  "/:userId",
  [param("userId").isInt()],
  handleValidationErrors,
  UserController.updateUser
);

router.delete(
  "/:userId",
  [param("userId").isInt()],
  handleValidationErrors,
  UserController.deleteUser
);

router.post(
  "/:userId/deposit",
  [param("userId").isInt()],
  handleValidationErrors,
  UserController.deposit
);

router.post(
  "/:userId/withdraw",
  [param("userId").isInt()],
  handleValidationErrors,
  UserController.withdraw
);

module.exports = router;
