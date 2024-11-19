const passport = require("passport");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.JWT_SECRET;
class AuthServices {

  async localLogin(req) {
    return new Promise((resolve, reject) => {
      passport.authenticate("local", (err, user, info) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return reject(new Error("Usuário ou senha incorretos"));
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

        resolve(userData);
      })(req);
    });
  }

  async gitHubCallback(req) {
    return new Promise((resolve, reject) => {
      passport.authenticate("github", (err, user, info) => {
        if (err) {
          return reject(err);
        }

        if (!user) {
          return reject(new Error("Autenticação falhou"));
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

        resolve(userData);
      })(req);
    });
  }
}

module.exports = new AuthServices();
