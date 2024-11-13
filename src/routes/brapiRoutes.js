const express = require("express");
const BrapiController = require("../controllers/brapiController");

const router = express.Router();

router.post("/asset/", BrapiController.getAsset);

router.post("/assets", BrapiController.getAssets);

module.exports = router;
