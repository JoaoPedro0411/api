const brapiService = require("../services/brapiService");

class BrapiController {

  async getAsset(req, res) {
    const { tickers } = req.body;
    try {
      const assetData = await brapiService.getAsset(tickers);
      return res.status(200).json(assetData);
    } catch (error) {
      console.error("Erro no controller ao buscar ativo:", error.message);
      return res.status(500).json({ error: "Erro ao obter dados do ativo" });
    }
  }

  async getAssets(req, res) {
    const { type, limit } = req.body;
    try {
      const assetsData = await brapiService.getAssets(type, limit);
      return res.status(200).json(assetsData);
    } catch (error) {
      console.error("Erro no controller ao buscar lista de ativos:", error.message);
      return res.status(500).json({ error: "Erro ao obter lista de ativos" });
    }
  }
}

module.exports = new BrapiController();
