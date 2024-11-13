const UserAssets = require("../models/user-assets");
const Transaction = require("../models/transaction");
const BrapiService = require("./BrapiService");

class PortfolioService {

  async sellStock(userId, symbol, quantityToSell, price) {
    try {
      let remainingQuantity = quantityToSell;
      const transactions = await Transaction.findAll({
        where: { userId, transactionAssetId: symbol, transactionType: "buy" },
        order: [["transactionDate", "ASC"]],
      });
  
      let totalCost = 0;
  
      for (const transaction of transactions) {
        if (remainingQuantity <= 0) break;
  
        const lotQuantity = transaction.transactionAssetQuantity;
        const quantityToDeduct = Math.min(remainingQuantity, lotQuantity);
  
        totalCost += quantityToDeduct * transaction.transactionCost;
        remainingQuantity -= quantityToDeduct;
  
        // Atualizar o lote ou removê-lo se estiver esgotado
        if (quantityToDeduct === lotQuantity) {
          await transaction.destroy();
        } else {
          await transaction.update({
            transactionAssetQuantity: lotQuantity - quantityToDeduct,
          });
        }
      }
  
      if (remainingQuantity > 0) {
        throw new Error("Quantidade insuficiente para venda");
      }
  
      return totalCost;
    } catch (error) {
      console.error("Erro ao vender ação usando FIFO:", error.message);
      throw error;
    }
  }
  

}
module.exports = new PortfolioService();
