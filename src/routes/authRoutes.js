const express = require("express");
const passport = require("passport");
const router = express.Router();
const AuthController = require("../controllers/authController");

router.post("/login", AuthController.localLogin);

router.get("/github/login", AuthController.gitHubLogin);

router.get("/github/callback", AuthController.gitHubCallback);

module.exports = router;
