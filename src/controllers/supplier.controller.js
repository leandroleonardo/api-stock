const db = require('../models/db');

exports.getAll = (req, res) => {
  db.all('SELECT * FROM suppliers', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

exports.getById = (req, res) => {
  db.get('SELECT * FROM suppliers WHERE id = ?', [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json(row);
  });
};

exports.create = (req, res) => {
  const { name, contact } = req.body;
  db.run(
    'INSERT INTO suppliers (name, contact) VALUES (?, ?)',
    [name, contact],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, contact });
    }
  );
};

exports.update = (req, res) => {
  const { name, contact } = req.body;
  db.run(
    'UPDATE suppliers SET name = ?, contact = ? WHERE id = ?',
    [name, contact, req.params.id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });
      res.json({ message: 'Fornecedor atualizado' });
    }
  );
};

exports.remove = (req, res) => {
  db.run('DELETE FROM suppliers WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Fornecedor não encontrado' });
    res.json({ message: 'Fornecedor removido' });
  });
};