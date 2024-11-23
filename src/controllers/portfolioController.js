const PortfolioService = require("../services/portfolioService");

class PortfolioController {
  async buyStock(req, res) {
    const { userId } = req.user;
    const { ticker, quantity, price, assetName, type, logoUrl} = req.body;
    console.log("Dados recebidos no backend para compra:", req.body);
    try {
      const asset = await PortfolioService.buyStock(userId, ticker, quantity, price, assetName, type, logoUrl);
      return res.status(200).json({
        message: "Ações compradas com sucesso",
        asset,
      });
    } catch (error) {
      console.error("(buyStock - portfolioController BackEnd): Erro ao comprar ações:", error.message);
      return res.status(500).json({ error: "(buyStock - portfolioController BackEnd): Erro ao processar compra de ações" });
    }
  }

  async sellStock(req, res) {
    const { userId } = req.user;
    const { ticker, quantity, price, assetName, type, logoUrl} = req.body;

    try {
      const totalCost = await PortfolioService.sellStock(userId, ticker, quantity, price, assetName, type, logoUrl);
      return res.status(200).json({
        message: "Ações vendidas com sucesso",
        totalCost,
      });
    } catch (error) {
      console.error("(sellStock - portfolioController BackEnd): Erro ao vender ações:", error.message);
      return res.status(500).json({ error: "(sellStock - portfolioController BackEnd): Erro ao processar venda de ações" });
    }
  }

  async getPortfolio(req, res) {
    const { userId } = req.user;

    try {
      const portfolio = await PortfolioService.getUserAssetsWithChange(userId);
      return res.status(200).json(portfolio);
    } catch (error) {
      console.error("(getPortfolio - portfolioController BackEnd): Erro ao obter portfólio:", error.message);
      return res.status(500).json({ error: "Erro ao obter portfólio" });
    }
  }

  async getTransactionHistory(req, res) {
    const { userId } = req.user;

    try {
      const history = await PortfolioService.getTransactionHistory(userId);
      return res.status(200).json(history);
    } catch (error) {
      console.error("(getTransactionHistory - portfolioController BackEnd): Erro ao obter histórico de transações:", error.message);
      return res.status(500).json({ error: "(getTransactionHistory - portfolioController BackEnd): Erro ao obter histórico de transações" });
    }
  }

  async calculateReturn(req, res) {
    const { userId } = req.user;

    try {
      const result = await PortfolioService.calculateReturn(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error("(calculateReturn - portfolioController BackEnd): Erro ao calcular rentabilidade:", error.message);
      return res.status(500).json({ error: "(calculateReturn - portfolioController BackEnd): Erro ao calcular rentabilidade" });
    }
  }

  async getUserAssetsWithChange(req, res) {
    const { userId } = req.user;

    try {
      const assets = await PortfolioService.getUserAssetsWithChange(userId);
      return res.status(200).json(assets);
    } catch (error) {
      console.error("(getUserAssetsWithChange - portfolioController BackEnd): Erro ao obter ativos do usuário com variação de preço:", error.message);
      return res.status(500).json({ error: "(getUserAssetsWithChange - portfolioController BackEnd): Erro ao obter ativos do usuário com variação de preço" });
    }
  }

  async getDetailedAssets(req, res) {
    const { type, limit } = req.query;

    try {
      const assets = await PortfolioService.getDetailedAssets(type, limit);
      return res.status(200).json(assets);
    } catch (error) {
      console.error("(getDetailedAssets - portfolioController BackEnd): Erro ao obter ativos detalhados:", error.message);
      return res.status(500).json({ error: "(getDetailedAssets - portfolioController BackEnd): Erro ao obter ativos detalhados" });
    }
  }
  
}

module.exports = new PortfolioController();
