const db = require('../models/db');
const stockController = require('./stock.controller'); // Importa o controller de estoque

exports.getAll = (req, res) => {
  const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
  const per_page = parseInt(req.query.per_page) > 0 ? parseInt(req.query.per_page) : 10;
  const offset = (page - 1) * per_page;

  // Filtro simples (exemplo: busca por nome)
  let whereClause = '';
  let params = [];

  if (req.query.simpleFilter) {
    whereClause = 'WHERE name LIKE ?';
    params.push(`%${req.query.simpleFilter}%`);
  }

  db.get(`SELECT COUNT(*) as total FROM products ${whereClause}`, params, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });

    const total = countResult.total || 0;
    const total_pages = total > 0 ? Math.ceil(total / per_page) : 1;

    db.all(
      `SELECT * FROM products ${whereClause} LIMIT ? OFFSET ?`,
      [...params, per_page, offset],
      (err2, rows) => {
        if (err2) return res.status(500).json({ error: err2.message });

        res.json({
          page,
          per_page,
          total,
          total_pages,
          data: rows || []
        });
      }
    );
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
  const { name, quantity, categoryId, supplierId, image, description } = req.body;

  // Verifica se a categoria existe
  db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!category) return res.status(400).json({ error: 'Categoria não encontrada' });

    // Se supplierId foi informado, valida se existe
    if (supplierId) {
      db.get('SELECT id FROM suppliers WHERE id = ?', [supplierId], (err2, supplier) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (!supplier) return res.status(400).json({ error: 'Fornecedor não encontrado' });
        insertProduct();
      });
    } else {
      insertProduct();
    }

    function insertProduct() {
      db.run(
        'INSERT INTO products (name, quantity, categoryId, supplierId, image, description) VALUES (?, ?, ?, ?, ?, ?)',
        [name, quantity, categoryId, supplierId || null, image || null, description || null],
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });

          // Registra movimentação de estoque como entrada (in)
          const productId = this.lastID;
          const date = new Date().toISOString();
          db.run(
            'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
            [productId, quantity, 'in', date],
            function (err4) {
              if (err4) return res.status(500).json({ error: err4.message });
              res.status(201).json({ id: productId, name, quantity, categoryId, supplierId: supplierId || null });
            }
          );
        }
      );
    }
  });
};

exports.update = (req, res) => {
  const { name, quantity, categoryId, supplierId, image, description } = req.body;

  // Verifica se a categoria existe
  db.get('SELECT id FROM categories WHERE id = ?', [categoryId], (err, category) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!category) return res.status(400).json({ error: 'Categoria não encontrada' });

    // Se supplierId foi informado, valida se existe
    if (supplierId) {
      db.get('SELECT id FROM suppliers WHERE id = ?', [supplierId], (err2, supplier) => {
        if (err2) return res.status(500).json({ error: err2.message });
        if (!supplier) return res.status(400).json({ error: 'Fornecedor não encontrado' });
        proceedUpdate();
      });
    } else {
      proceedUpdate();
    }

    function proceedUpdate() {
      // Busca a quantidade atual antes de atualizar
      db.get('SELECT quantity FROM products WHERE id = ?', [req.params.id], function (err3, row) {
        if (err3) return res.status(500).json({ error: err3.message });
        if (!row) return res.status(404).json({ error: 'Produto não encontrado' });

        const oldQuantity = row.quantity;
        const type = quantity > oldQuantity ? 'in' : 'out';

        db.run(
          'UPDATE products SET name = ?, quantity = ?, categoryId = ?, supplierId = ?, image = ?, description = ? WHERE id = ?',
          [name, quantity, categoryId, supplierId || null, image || null, description || null, req.params.id],
          function (err4) {
            if (err4) return res.status(500).json({ error: err4.message });

            // Registra movimentação de estoque
            const productId = req.params.id;
            const date = new Date().toISOString();
            db.run(
              'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
              [productId, Math.abs(quantity - oldQuantity), type, date],
              function (err5) {
                if (err5) return res.status(500).json({ error: err5.message });
                res.json({ message: 'Produto atualizado' });
              }
            );
          }
        );
      });
    }
  });
};

exports.remove = (req, res) => {
  db.run('DELETE FROM products WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Produto removido' });
  });
};

// Adiciona quantidade ao produto
exports.addStock = (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Informe uma quantidade positiva para adicionar.' });
  }

  db.get('SELECT quantity FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });

    const newQuantity = row.quantity + quantity;
    db.run('UPDATE products SET quantity = ? WHERE id = ?', [newQuantity, productId], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });

      // Registra movimentação de entrada
      const date = new Date().toISOString();
      db.run(
        'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
        [productId, quantity, 'in', date],
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: `Adicionado ${quantity} itens ao produto ${productId}.` });
        }
      );
    });
  });
};

// Remove quantidade do produto
exports.removeStock = (req, res) => {
  const { quantity } = req.body;
  const productId = req.params.id;

  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'Informe uma quantidade positiva para remover.' });
  }

  db.get('SELECT quantity FROM products WHERE id = ?', [productId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Produto não encontrado' });

    if (row.quantity < quantity) {
      return res.status(400).json({ error: 'Quantidade insuficiente em estoque.' });
    }

    const newQuantity = row.quantity - quantity;
    db.run('UPDATE products SET quantity = ? WHERE id = ?', [newQuantity, productId], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });

      // Registra movimentação de saída
      const date = new Date().toISOString();
      db.run(
        'INSERT INTO stock (productId, quantity, type, date) VALUES (?, ?, ?, ?)',
        [productId, quantity, 'out', date],
        function (err3) {
          if (err3) return res.status(500).json({ error: err3.message });
          res.json({ message: `Removido ${quantity} itens do produto ${productId}.` });
        }
      );
    });
  });
};
