const express = require('express');
const router = express.Router();
const StockController = require('../controllers/stock.controller');

router.get('/', StockController.getAll);
router.post('/', StockController.create);

module.exports = router;
