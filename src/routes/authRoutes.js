const express = require("express");
const passport = require("passport");
const router = express.Router();
const AuthServices = require('../services/authServices')

router.post("/login", (req, res, next) => {
  AuthServices.localLogin(req, res, next);
});

router.get(
  "/github/login",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get("/github/callback", (req, res, next) => {
  AuthServices.gitHubCallback(req, res, next);
});

module.exports = router;
