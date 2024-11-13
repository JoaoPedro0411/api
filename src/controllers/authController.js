const authServices = require("../services/authService");

class AuthController {
    async localLogin(req, res, next) {
        try {
          const userData = await authServices.localLogin(req, res, next);
          return res.status(200).json(userData);
        } catch (error) {
          console.error("Erro no login:", error.message);
          return res.status(400).json({ error: error.message });
        }
      }
  async gitHubLogin(req, res, next) {
    authServices.githubLogin(req, res, next);
  }

  async gitHubCallback(req, res, next) {
    try {
      const userData = await authServices.gitHubCallback(req, res, next);
      return res.status(200).json(userData);
    } catch (error) {
      console.error("Erro no GitHub callback:", error.message);
      return res
        .status(500)
        .json({ error: "Erro ao realizar login com GitHub" });
    }
  }
}

module.exports = new AuthController();
