const db = require('../models/db');

exports.getAll = (req, res) => {
  db.all(
    `SELECT stock.*, products.supplierId 
     FROM stock 
     LEFT JOIN products ON stock.productId = products.id`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

exports.getById = (req, res) => {
  db.get(
    `SELECT stock.*, products.supplierId 
     FROM stock 
     LEFT JOIN products ON stock.productId = products.id
     WHERE stock.id = ?`,
    [req.params.id],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: 'Registro de estoque não encontrado' });
      res.json(row);
    }
  );
};

exports.create = (req, res) => {
  const { productId, quantity, date } = req.body;
  db.run(
    'INSERT INTO stock (productId, quantity, date) VALUES (?, ?, ?)',
    [productId, quantity, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, productId, quantity, date });
    }
  );
};

exports.update = (req, res) => {
  const { productId, quantity, date } = req.body;
  db.run(
    'UPDATE stock SET productId = ?, quantity = ?, date = ? WHERE id = ?',
    [productId, quantity, date, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Registro de estoque atualizado' });
    }
  );
};

exports.remove = (req, res) => {
  db.run('DELETE FROM stock WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Registro de estoque removido' });
  });
};