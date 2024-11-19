const UserAssets = require("../models/user-assets");
const Transaction = require("../models/transaction");
const brapiService = require("./brapiService");

class PortfolioService {

  async buyStock(userId, ticker, quantity, price) {
    try {
      let asset = await UserAssets.findOne({
        where: { userId, assetTicker: ticker },
      });

      if (asset) {
        const totalQuantity = asset.assetTotalQuantity + quantity;
        const averagePrice =
          (asset.averageAssetPrice * asset.assetTotalQuantity +
            price * quantity) /
          totalQuantity;

        await asset.update({
          assetTotalQuantity: totalQuantity,
          averageAssetPrice: averagePrice,
        });
      } else {
        asset = await UserAssets.create({
          userId,
          assetTicker: ticker,
          assetTotalQuantity: quantity,
          averageAssetPrice: price,
        });
      }

      await Transaction.create({
        userId,
        transactionAssetTicker: ticker,
        transactionDate: new Date(),
        transactionCost: price,
        transactionType: "buy",
        transactionAssetQuantity: quantity,
        isActive: true,
      });

      return asset;
    } catch (error) {
      console.error("Erro ao comprar ações:", error.message);
      throw new Error("Erro ao processar compra de ações");
    }
  }

  async sellStock(userId, ticker, quantityToSell, price) {
    try {
      let remainingQuantity = quantityToSell;
      const transactions = await Transaction.findAll({
        where: {
          userId,
          transactionAssetTicker: ticker,
          transactionType: "buy",
          isActive: true,
        },
        order: [["transactionDate", "ASC"]],
      });

      let totalCost = 0;

      for (const transaction of transactions) {
        if (remainingQuantity <= 0) break;

        const lotQuantity = transaction.transactionAssetQuantity;
        const quantityToDeduct = Math.min(remainingQuantity, lotQuantity);

        totalCost += quantityToDeduct * transaction.transactionCost;
        remainingQuantity -= quantityToDeduct;

        if (quantityToDeduct === lotQuantity) {
          await transaction.update({ isActive: false });
        } else {
          await transaction.update({
            transactionAssetQuantity: lotQuantity - quantityToDeduct,
          });
        }
      }

      if (remainingQuantity > 0) {
        throw new Error("Quantidade insuficiente para venda");
      }

      const asset = await UserAssets.findOne({
        where: { userId, assetTicker: ticker },
      });
      const newTotalQuantity = asset.assetTotalQuantity - quantityToSell;

      if (newTotalQuantity <= 0) {
        await asset.destroy();
      } else {
        await asset.update({
          assetTotalQuantity: newTotalQuantity,
        });
      }

      return totalCost;
    } catch (error) {
      console.error("Erro ao vender ações usando FIFO:", error.message);
      throw error;
    }
  }

  async getTransactionHistory(userId) {
    try {
      const transactions = await Transaction.findAll({
        where: { userId },
        order: [["transactionDate", "DESC"]],
      });
      return transactions;
    } catch (error) {
      console.error("Erro ao obter histórico de transações:", error.message);
      throw new Error("Erro ao obter histórico de transações");
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
      console.error("Erro ao calcular rentabilidade:", error.message);
      throw new Error("Erro ao calcular rentabilidade");
    }
  }

  async getDetailedAssets(type, limit) {
    try {
      const assets = await brapiService.getAssetsWithChange(type, limit);
      return assets;
    } catch (error) {
      console.error("Erro ao obter ativos detalhados:", error.message);
      throw new Error("Erro ao obter ativos detalhados");
    }
  }
  
  async getUserAssetsWithChange(userId) {
    try {
      const userAssets = await UserAssets.findAll({ where: { userId } });

      if (userAssets.length === 0) {
        throw new Error("O usuário não possui ativos.");
      }

      const assetsWithChange = [];

      for (const asset of userAssets) {
        const ticker = asset.assetTicker;

        const assetDetails = await brapiService.getAsset(ticker);

        if (!assetDetails) {
          console.error(`Dados não encontrados para o ativo ${ticker}`);
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
        "Erro ao obter ativos do usuário com variação de preço:",
        error.message
      );
      throw new Error("Erro ao obter ativos do usuário com variação de preço");
    }
  }

}

module.exports = new PortfolioService();
