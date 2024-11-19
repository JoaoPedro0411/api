const passport = require("passport");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;

class AuthServices {
  localLogin = (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ error: "Usuário ou senha incorretos" });
      }

      const token = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "1h",
      });

      const userData = {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userToken: token,
      };

      return res.status(200).json(userData);
    })(req, res, next);
  };

  gitHubCallback = (req, res, next) => {
    passport.authenticate("github", (err, user, info) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({ message: "Autenticação falhou" });
      }
      const token = jwt.sign({ userId: user.userId }, SECRET_KEY, {
        expiresIn: "1h",
      });

      const userData = {
        userId: user.userId,
        userName: user.userName,
        userEmail: user.userEmail,
        userToken: token,
      };

      return res.send(`
        <script>
          const data = ${JSON.stringify(userData)};
          window.ReactNativeWebView.postMessage(JSON.stringify(data));
        </script>
      `);
    })(req, res, next);
  };

  githubLogin = (req, res, next) => {
    passport.authenticate("github", { scope: ["user:email"], prompt: "login" })(
      req,
      res,
      next
    );
  };
}

module.exports = new AuthServices();
