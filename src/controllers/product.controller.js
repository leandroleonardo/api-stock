const db = require('../models/db');
const stockController = require('./stock.controller'); // Importa o controller de estoque

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

  // Verifica se a categoria existe
  db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!category) return res.status(400).json({ error: 'Categoria não encontrada' });

    db.run(
      'INSERT INTO products (name, quantity, categoryId) VALUES (?, ?, ?)',
      [name, quantity, categoryId],
      function (err2) {
        if (err2) return res.status(500).json({ error: err2.message });

        // Registra movimentação de estoque como entrada (in)
        const productId = this.lastID;
        const date = new Date().toISOString();
        db.run(
          'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
          [productId, quantity, 'in', date],
          function (err3) {
            if (err3) return res.status(500).json({ error: err3.message });
            res.status(201).json({ id: productId, name, quantity, categoryId });
          }
        );
      }
    );
  });
};

exports.update = (req, res) => {
  const { name, quantity, categoryId } = req.body;

  // Verifica se a categoria existe
  db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!category) return res.status(400).json({ error: 'Categoria não encontrada' });

    // Primeiro, busca a quantidade atual
    db.get('SELECT quantity FROM products WHERE id = ?', [req.params.id], function (err2, row) {
      if (err2) return res.status(500).json({ error: err2.message });
      if (!row) return res.status(404).json({ error: 'Produto não encontrado' });

      const oldQuantity = row.quantity;
      const type = quantity > oldQuantity ? 'in' : 'out';
      db.run(
        'UPDATE products SET name = ?, quantity = ?, categoryId = ? WHERE id = ?',
        [name, quantity, categoryId, req.params.id],
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });

          // Registra movimentação de estoque
          const productId = req.params.id;
          const date = new Date().toISOString();
          db.run(
            'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
            [productId, Math.abs(quantity - oldQuantity), type, date],
            function (err4) {
              if (err4) return res.status(500).json({ error: err4.message });
              res.json({ message: 'Produto atualizado' });
            }
          );
        }
      );
    });
  });
};

exports.remove = (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto removido' });
  });
};
