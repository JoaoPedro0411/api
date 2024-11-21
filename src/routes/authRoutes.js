const express = require("express");
const passport = require("passport");
const router = express.Router();
const AuthController = require("../controllers/authController");
const authenticateJWT = require("../middlewares/authMiddleware");

router.post("/login", AuthController.localLogin);

router.get("/github/login", AuthController.gitHubLogin);

router.get("/github/callback", AuthController.gitHubCallback);

router.post("/verify-token", authenticateJWT, (req, res) => {
  res.status(200).json({ valid: true, user: req.user });
});
module.exports = router;
