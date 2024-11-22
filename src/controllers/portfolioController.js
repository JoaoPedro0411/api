const PortfolioService = require("../services/portfolioService");

class PortfolioController {
  async buyStock(req, res) {
    const { userId } = req.user;
    const { ticker, quantity, price } = req.body;

    try {
      const asset = await PortfolioService.buyStock(
        userId,
        ticker,
        quantity,
        price
      );
      return res.status(200).json({
        message: "Ações compradas com sucesso",
        asset,
      });
    } catch (error) {
      console.error(
        "(buyStock - portfolioController BackEnd): Erro ao comprar ações:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(buyStock - portfolioController BackEnd): Erro ao processar compra de ações",
        });
    }
  }

  async sellStock(req, res) {
    const { userId } = req.user;
    const { ticker, quantity, price } = req.body;

    try {
      const totalCost = await PortfolioService.sellStock(
        userId,
        ticker,
        quantity,
        price
      );
      return res.status(200).json({
        message: "Ações vendidas com sucesso",
        totalCost,
      });
    } catch (error) {
      console.error(
        "(sellStock - portfolioController BackEnd): Erro ao vender ações:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(sellStock - portfolioController BackEnd): Erro ao processar venda de ações",
        });
    }
  }

  async getPortfolio(req, res) {
    const { userId } = req.user;

    try {
      const portfolio = await PortfolioService.getUserAssetsWithChange(userId);
      return res.status(200).json(portfolio);
    } catch (error) {
      console.error(
        "(getPortfolio - portfolioController BackEnd): Erro ao obter portfólio:",
        error.message
      );
      return res.status(500).json({ error: "Erro ao obter portfólio" });
    }
  }

  async getTransactionHistory(req, res) {
    const { userId } = req.user;

    try {
      const history = await PortfolioService.getTransactionHistory(userId);
      return res.status(200).json(history);
    } catch (error) {
      console.error(
        "(getTransactionHistory - portfolioController BackEnd): Erro ao obter histórico de transações:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(getTransactionHistory - portfolioController BackEnd): Erro ao obter histórico de transações",
        });
    }
  }

  async calculateReturn(req, res) {
    const { userId } = req.user;

    try {
      const result = await PortfolioService.calculateReturn(userId);
      return res.status(200).json(result);
    } catch (error) {
      console.error(
        "(calculateReturn - portfolioController BackEnd): Erro ao calcular rentabilidade:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(calculateReturn - portfolioController BackEnd): Erro ao calcular rentabilidade",
        });
    }
  }

  async getUserAssetsWithChange(req, res) {
    const { userId } = req.user;

    try {
      const assets = await PortfolioService.getUserAssetsWithChange(userId);
      return res.status(200).json(assets);
    } catch (error) {
      console.error(
        "(getUserAssetsWithChange - portfolioController BackEnd): Erro ao obter ativos do usuário com variação de preço:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(getUserAssetsWithChange - portfolioController BackEnd): Erro ao obter ativos do usuário com variação de preço",
        });
    }
  }

  async getDetailedAssets(req, res) {
    const { type, limit } = req.query;

    try {
      const assets = await PortfolioService.getDetailedAssets(type, limit);
      return res.status(200).json(assets);
    } catch (error) {
      console.error(
        "(getDetailedAssets - portfolioController BackEnd): Erro ao obter ativos detalhados:",
        error.message
      );
      return res
        .status(500)
        .json({
          error:
            "(getDetailedAssets - portfolioController BackEnd): Erro ao obter ativos detalhados",
        });
    }
  }
  async calculateReturn(userId) {
    try {
      const assets = await UserAssets.findAll({ where: { userId } });

      let totalInvested = 0;
      let totalValue = 0;

      for (const asset of assets) {
        const currentPriceData = await brapiService.getAsset(asset.assetTicker);
        const currentPrice = currentPriceData.regularMarketPrice;
        const value = currentPrice * asset.assetTotalQuantity;
        const invested = asset.averageAssetPrice * asset.assetTotalQuantity;

        totalInvested += invested;
        totalValue += value;
      }

      const returnPercentage =
        ((totalValue - totalInvested) / totalInvested) * 100;
      return { totalInvested, totalValue, returnPercentage };
    } catch (error) {
      console.error(
        " (calculateReturn - portfolioService BackEnd): Erro ao calcular rentabilidade:",
        error.message
      );
      throw new Error(
        "(calculateReturn - portfolioService BackEnd): Erro ao calcular rentabilidade"
      );
    }
  }

  async getDetailedAssets(type, limit) {
    try {
      const assets = await brapiService.getAssetsWithChange(type, limit);
      return assets;
    } catch (error) {
      console.error(
        "(getDetailedAssets - portfolioService BackEnd): Erro ao obter ativos detalhados:",
        error.message
      );
      throw new Error(
        "(getDetailedAssets - portfolioService BackEnd): Erro ao obter ativos detalhados"
      );
    }
  }

  async getUserAssetsWithChange(userId) {
    try {
      const userAssets = await UserAssets.findAll({ where: { userId } });

      if (userAssets.length === 0) {
        throw new Error(
          "(getUserAssetsWithChange - portfolioService BackEnd): O usuário não possui ativos."
        );
      }

      const assetsWithChange = [];

      for (const asset of userAssets) {
        const ticker = asset.assetTicker;

        const assetDetails = await brapiService.getAsset(ticker);

        if (!assetDetails) {
          console.error(
            `(getUserAssetsWithChange - portfolioService BackEnd): Dados não encontrados para o ativo ${ticker}`
          );
          continue;
        }
        const currentPrice = assetDetails.regularMarketPrice;
        const previousClose = assetDetails.regularMarketPreviousClose;
        const priceChangePercent =
          ((currentPrice - previousClose) / previousClose) * 100;

        const assetData = {
          ticker,
          shortName: assetDetails.shortName,
          longName: assetDetails.longName,
          currentPrice,
          previousClose,
          priceChangePercent: priceChangePercent.toFixed(2),
          logoUrl: assetDetails.logoUrl,
          quantity: asset.assetTotalQuantity,
          averagePrice: asset.averageAssetPrice,
        };

        assetsWithChange.push(assetData);
      }

      return assetsWithChange;
    } catch (error) {
      console.error(
        "(getUserAssetsWithChange - portfolioService BackEnd): Erro ao obter ativos do usuário com variação de preço:",
        error.message
      );
      throw new Error(
        "(getUserAssetsWithChange - portfolioService BackEnd): Erro ao obter ativos do usuário com variação de preço"
      );
    }
  }
}

module.exports = new PortfolioController();
