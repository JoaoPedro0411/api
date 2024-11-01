const passport = require("passport");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

class AuthServices {
  
  localLogin = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err || !user) {
        return res
          .status(400)
          .json({ message: "Erro na autenticação", ...info });
      }
      const token = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "1h",
      });

      return res.status(200).json({
        token,
        message: "Login realizado com sucesso!",
      });
    })(req, res, next); 
  };

  gitHubCallback = (req, res, next) => {
    passport.authenticate("github", (err, user, info) => {
      if (err) return next(err);
      if (!user)
        return res.status(401).json({ message: "Autenticação falhou" });


      const token = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "1h",
      });
      res.redirect(`myapp://auth?token=${token}`);
      // return res.status(200).json({
      //   token,
      //   message: "Autenticação com GitHub realizada com sucesso!",
      // });
    })(req, res, next); 
}
}

module.exports = new AuthServices();
