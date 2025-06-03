const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');

router.get('/', CategoryController.getAll);
router.get('/:id', CategoryController.getById);
router.post('/', CategoryController.create);
router.put('/:id', CategoryController.update);
router.delete('/:id', CategoryController.remove);

module.exports = router;