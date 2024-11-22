const UserAssets = require("../models/user-assets");
const Transaction = require("../models/transaction");
const brapiService = require("./brapiService");
const User = require("../models/user");

class PortfolioService {
  async buyStock(userId, ticker, quantity, assetName, type, logoUrl, price) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(
          "(buyStock - PortfolioService): Usuário não encontrado"
        );
      }

      const totalCost = price * quantity;

      if (user.userBalance < totalCost) {
        throw new Error(
          `(buyStock - PortfolioService): Saldo insuficiente. Saldo atual: R$${user.userBalance.toFixed(
            2
          )}, custo da compra: R$${totalCost.toFixed(2)}`
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
            assetName: assetName,
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
        `(buyStock - PortfolioService): Erro ao processar compra de ações`
      );
    }
  }

  async sellStock(userId, ticker, quantityToSell, price) {
    const transaction = await sequelize.transaction();
    try {
      let remainingQuantity = quantityToSell;
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error(
          "(sellStock - PortfolioService): Usuário não encontrado"
        );
      }

      const transactions = await Transaction.findAll({
        where: {
          userId,
          transactionAssetTicker: ticker,
          transactionType: "buy",
          isActive: true,
        },
        order: [["transactionDate", "ASC"]],
      });

      let totalEarnings = 0;

      for (const transaction of transactions) {
        if (remainingQuantity <= 0) break;

        const lotQuantity = transaction.transactionAssetQuantity;
        const quantityToDeduct = Math.min(remainingQuantity, lotQuantity);

        totalEarnings += quantityToDeduct * price;
        remainingQuantity -= quantityToDeduct;

        if (quantityToDeduct === lotQuantity) {
          await transaction.update({ isActive: false }, { transaction });
        } else {
          await transaction.update(
            {
              transactionAssetQuantity: lotQuantity - quantityToDeduct,
            },
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
        `(sellStock - PortfolioService): Erro ao processar venda de ações`
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

module.exports = new PortfolioService();
