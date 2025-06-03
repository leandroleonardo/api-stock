const db = require('../models/db');

exports.getAll = (req, res) => {
  db.all('SELECT * FROM products', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(row);
  });
};

exports.create = (req, res) => {
  const { name, quantity, categoryId } = req.body;
  db.run(
    'INSERT INTO products (name, quantity, categoryId) VALUES (?, ?, ?)',
    [name, quantity, categoryId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, quantity, categoryId });
    }
  );
};

exports.update = (req, res) => {
  const { name, quantity, categoryId } = req.body;
  db.run(
    'UPDATE products SET name = ?, quantity = ?, categoryId = ? WHERE id = ?',
    [name, quantity, categoryId, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Produto atualizado' });
    }
  );
};

exports.remove = (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto removido' });
  });
};
