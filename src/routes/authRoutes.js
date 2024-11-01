const express = require("express");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET;

router.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({ message: "Erro na autenticação", ...info });
    }
    const token = jwt.sign({ userId: user.userId }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({
      token,
      message: "Login realizado com sucesso!"
    });
  })(req, res, next);
});

router.get("/github/login", passport.authenticate("github"));

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false }),
  (req, res) => {
    const token = jwt.sign({ userId: req.user.userId }, SECRET_KEY, { expiresIn: "1h" });
    return res.status(200).json({
      token,
      message: "Autenticação com GitHub realizada com sucesso!"
    });
  }
);

module.exports = router;
