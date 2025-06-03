const db = require('../models/db');

exports.getAll = (req, res) => {
  db.all('SELECT * FROM categories', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  db.get('SELECT * FROM categories WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Categoria não encontrada' });
    res.json(row);
  });
};

exports.create = (req, res) => {
  const { name } = req.body;
  db.run(
    'INSERT INTO categories (name) VALUES (?)',
    [name],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name });
    }
  );
};

exports.update = (req, res) => {
  const { name } = req.body;
  db.run(
    'UPDATE categories SET name = ? WHERE id = ?',
    [name, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Categoria atualizada' });
    }
  );
};

exports.remove = (req, res) => {
  db.run('DELETE FROM categories WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Categoria removida' });
  });
};