const express = require("express");
const { body, param } = require("express-validator");
const UserController = require("../controllers/userController");

const router = express.Router();

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
  ],
  UserController.createUser
);

router.get(
  "/:userId",
  [param("userId").isInt().withMessage("ID deve ser um número inteiro")],
  UserController.getUser
);

router.put("/:userId", [param("userId").isInt()], UserController.updateUser);

router.delete("/:userId", [param("userId").isInt()], UserController.deleteUser);

router.post(
  "/:userId/deposti",
  [param("userId").isInt()],
  UserController.deposit
);
router.post(
  "/:userId/withdraw",
  [param("userId").isInt()],
  UserController.withdraw
);

module.exports = router;
