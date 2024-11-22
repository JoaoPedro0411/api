const { sequelize } = require("../config/db-config");
const UserAssets = require("../models/user-assets");
const Transaction = require("../models/transaction");
const User = require("../models/user");
const brapiService = require("./brapiService");

class PortfolioService {
  async buyStock(userId, ticker, quantity, price, assetName, type, logoUrl) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("(buyStock - PortfolioService): Usuário não encontrado");
      }

      const totalCost = price * quantity;

      if (user.userBalance < totalCost) {
        throw new Error(
          `(buyStock - PortfolioService): Saldo insuficiente. Saldo atual: ${user.userBalance}, custo da compra: ${totalCost}`
        );
      }

      let asset = await UserAssets.findOne({
        where: { userId, assetTicker: ticker },
      });

      if (asset) {
        const totalQuantity = asset.assetTotalQuantity + quantity;
        const averagePrice =
          (asset.averageAssetPrice * asset.assetTotalQuantity +
            price * quantity) /
          totalQuantity;

        await asset.update(
          {
            assetTotalQuantity: totalQuantity,
            averageAssetPrice: averagePrice,
          },
          { transaction }
        );
      } else {
        asset = await UserAssets.create(
          {
            userId,
            assetTicker: ticker,
            assetTotalQuantity: quantity,
            averageAssetPrice: price,
            assetPrice: price,
            assetName:assetName,
            assetType: type,
            assetLogoUrl: logoUrl,
          },
          { transaction }
        );
      }

      await Transaction.create(
        {
          userId,
          transactionAssetTicker: ticker,
          transactionDate: new Date(),
          transactionCost: totalCost,
          transactionType: "buy",
          transactionAssetQuantity: quantity,
          isActive: true,
        },
        { transaction }
      );

      await user.update(
        { userBalance: user.userBalance - totalCost },
        { transaction }
      );

      await transaction.commit();
      return asset;
    } catch (error) {
      await transaction.rollback();
      console.error(
        `(buyStock - PortfolioService): Erro ao comprar ações: ${error.message}`
      );
      throw new Error(
        "(buyStock - PortfolioService): Erro ao processar compra de ações"
      );
    }
  }

  async sellStock(userId, ticker, quantityToSell, price) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("(sellStock - PortfolioService): Usuário não encontrado");
      }

      const totalEarnings = price * quantityToSell;

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

      for (const trans of transactions) {
        if (remainingQuantity <= 0) break;

        const lotQuantity = trans.transactionAssetQuantity;
        const quantityToDeduct = Math.min(remainingQuantity, lotQuantity);

        remainingQuantity -= quantityToDeduct;

        if (quantityToDeduct === lotQuantity) {
          await trans.update({ isActive: false }, { transaction });
        } else {
          await trans.update(
            { transactionAssetQuantity: lotQuantity - quantityToDeduct },
            { transaction }
          );
        }
      }

      if (remainingQuantity > 0) {
        throw new Error(
          `(sellStock - PortfolioService): Quantidade insuficiente para venda. Restante: ${remainingQuantity}`
        );
      }

      const asset = await UserAssets.findOne({
        where: { userId, assetTicker: ticker },
      });
      const newTotalQuantity = asset.assetTotalQuantity - quantityToSell;

      if (newTotalQuantity <= 0) {
        await asset.destroy({ transaction });
      } else {
        await asset.update(
          { assetTotalQuantity: newTotalQuantity },
          { transaction }
        );
      }

      await user.update(
        { userBalance: user.userBalance + totalEarnings },
        { transaction }
      );

      await transaction.commit();
      return totalEarnings;
    } catch (error) {
      await transaction.rollback();
      console.error(
        `(sellStock - PortfolioService): Erro ao vender ações: ${error.message}`
      );
      throw new Error(
        "(sellStock - PortfolioService): Erro ao processar venda de ações"
      );
    }
  }

  async getTransactionHistory(userId) {
    try {
      return await Transaction.findAll({
        where: { userId },
        order: [["transactionDate", "DESC"]],
      });
    } catch (error) {
      console.error(
        `(getTransactionHistory - PortfolioService): Erro: ${error.message}`
      );
      throw new Error(
        "(getTransactionHistory - PortfolioService): Erro ao obter histórico de transações"
      );
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
        `(calculateReturn - PortfolioService): Erro: ${error.message}`
      );
      throw new Error(
        "(calculateReturn - PortfolioService): Erro ao calcular rentabilidade"
      );
    }
  }

  async getDetailedAssets(type, limit) {
    try {
      return await brapiService.getAssetsWithChange(type, limit);
    } catch (error) {
      console.error(
        `(getDetailedAssets - PortfolioService): Erro: ${error.message}`
      );
      throw new Error(
        "(getDetailedAssets - PortfolioService): Erro ao obter ativos detalhados"
      );
    }
  }

  async getUserAssetsWithChange(userId) {
    try {
      const userAssets = await UserAssets.findAll({ where: { userId } });

      if (!userAssets.length) {
        throw new Error(
          "(getUserAssetsWithChange - PortfolioService): O usuário não possui ativos"
        );
      }

      const assetsWithChange = [];

      for (const asset of userAssets) {
        const assetDetails = await brapiService.getAsset(asset.assetTicker);

        if (!assetDetails) {
          console.error(
            `(getUserAssetsWithChange - PortfolioService): Dados ausentes para ${asset.assetTicker}`
          );
          continue;
        }

        const priceChangePercent =
          ((assetDetails.regularMarketPrice -
            assetDetails.regularMarketPreviousClose) /
            assetDetails.regularMarketPreviousClose) *
          100;

        assetsWithChange.push({
          ticker: asset.assetTicker,
          shortName: assetDetails.shortName,
          longName: assetDetails.longName,
          currentPrice: assetDetails.regularMarketPrice,
          previousClose: assetDetails.regularMarketPreviousClose,
          priceChangePercent: priceChangePercent.toFixed(2),
          logoUrl: assetDetails.logoUrl,
          quantity: asset.assetTotalQuantity,
          averagePrice: asset.averageAssetPrice,
        });
      }

      return assetsWithChange;
    } catch (error) {
      console.error(
        `(getUserAssetsWithChange - PortfolioService): Erro: ${error.message}`
      );
      throw new Error(
        "(getUserAssetsWithChange - PortfolioService): Erro ao obter ativos do usuário com variação de preço"
      );
    }
  }
}

module.exports = new PortfolioService();
