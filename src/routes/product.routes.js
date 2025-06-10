const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/', controller.getAll);
router.post('/', controller.create);
router.get('/:id', controller.getById);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

// Rotas para adicionar e remover itens do estoque
router.post('/:id/add-stock', controller.addStock);
router.post('/:id/remove-stock', controller.removeStock);

module.exports = router;
