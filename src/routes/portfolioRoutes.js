const express = require("express");
const PortfolioController = require("../controllers/portfolioController");
const authenticateJWT = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/buy", authenticateJWT, PortfolioController.buyStock);
router.post("/sell", authenticateJWT, PortfolioController.sellStock);
router.get("/portfolio", authenticateJWT, PortfolioController.getPortfolio);
router.get("/history", authenticateJWT, PortfolioController.getTransactionHistory);
router.get("/return", authenticateJWT, PortfolioController.calculateReturn);
router.get("/detailed-assets", PortfolioController.getDetailedAssets); 

module.exports = router;
