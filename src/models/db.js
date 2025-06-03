const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE suppliers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      contact TEXT
    )
  `);

  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      categoryId INTEGER NOT NULL,
      supplierId INTEGER,
      image TEXT,
      description TEXT,
      FOREIGN KEY(categoryId) REFERENCES categories(id),
      FOREIGN KEY(supplierId) REFERENCES suppliers(id)
    )
  `);

  db.run(`
    CREATE TABLE stock (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId INTEGER,
      type TEXT CHECK(type IN ('in', 'out')),
      quantity INTEGER,
      date TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(productId) REFERENCES products(id)
    )
  `);

  // Popula categorias
  db.run(`INSERT INTO categories (name) VALUES ('Eletrônicos')`);
  db.run(`INSERT INTO categories (name) VALUES ('Alimentos')`);

  // Popula fornecedores
  db.run(`INSERT INTO suppliers (name, contact) VALUES ('Fornecedor 1', 'contato@fornecedor1.com')`);
  db.run(`INSERT INTO suppliers (name, contact) VALUES ('Fornecedor 2', 'contato@fornecedor2.com')`);

  // Produtos eletrônicos
  const eletronicProducts = [
    { name: 'Notebook', image: 'https://exemplo.com/notebook.jpg', description: 'Notebook de alta performance' },
    { name: 'Smartphone', image: 'https://exemplo.com/smartphone.jpg', description: 'Smartphone Android' },
    { name: 'Tablet', image: 'https://exemplo.com/tablet.jpg', description: 'Tablet 10 polegadas' },
    { name: 'Monitor', image: 'https://exemplo.com/monitor.jpg', description: 'Monitor Full HD' },
    { name: 'Teclado', image: 'https://exemplo.com/teclado.jpg', description: 'Teclado mecânico' },
    { name: 'Mouse', image: 'https://exemplo.com/mouse.jpg', description: 'Mouse óptico' },
    { name: 'Impressora', image: 'https://exemplo.com/impressora.jpg', description: 'Impressora multifuncional' },
    { name: 'Roteador', image: 'https://exemplo.com/roteador.jpg', description: 'Roteador Wi-Fi' },
    { name: 'HD Externo', image: 'https://exemplo.com/hd.jpg', description: 'HD externo 1TB' },
    { name: 'SSD', image: 'https://exemplo.com/ssd.jpg', description: 'SSD 512GB' },
    { name: 'Webcam', image: 'https://exemplo.com/webcam.jpg', description: 'Webcam HD' },
    { name: 'Caixa de Som', image: 'https://exemplo.com/caixa.jpg', description: 'Caixa de som Bluetooth' },
    { name: 'Fone de Ouvido', image: 'https://exemplo.com/fone.jpg', description: 'Fone de ouvido sem fio' },
    { name: 'Smartwatch', image: 'https://exemplo.com/smartwatch.jpg', description: 'Relógio inteligente' },
    { name: 'Projetor', image: 'https://exemplo.com/projetor.jpg', description: 'Projetor portátil' }
  ];

  // Produtos alimentos
  const foodProducts = [
    { name: 'Arroz', image: 'https://exemplo.com/arroz.jpg', description: 'Arroz branco tipo 1' },
    { name: 'Feijão', image: 'https://exemplo.com/feijao.jpg', description: 'Feijão carioca' },
    { name: 'Macarrão', image: 'https://exemplo.com/macarrao.jpg', description: 'Macarrão espaguete' },
    { name: 'Óleo', image: 'https://exemplo.com/oleo.jpg', description: 'Óleo de soja' },
    { name: 'Açúcar', image: 'https://exemplo.com/acucar.jpg', description: 'Açúcar refinado' },
    { name: 'Sal', image: 'https://exemplo.com/sal.jpg', description: 'Sal refinado' },
    { name: 'Café', image: 'https://exemplo.com/cafe.jpg', description: 'Café torrado e moído' },
    { name: 'Leite', image: 'https://exemplo.com/leite.jpg', description: 'Leite integral' },
    { name: 'Farinha', image: 'https://exemplo.com/farinha.jpg', description: 'Farinha de trigo' },
    { name: 'Biscoito', image: 'https://exemplo.com/biscoito.jpg', description: 'Biscoito recheado' },
    { name: 'Margarina', image: 'https://exemplo.com/margarina.jpg', description: 'Margarina cremosa' },
    { name: 'Achocolatado', image: 'https://exemplo.com/achocolatado.jpg', description: 'Achocolatado em pó' },
    { name: 'Suco', image: 'https://exemplo.com/suco.jpg', description: 'Suco de laranja' },
    { name: 'Refrigerante', image: 'https://exemplo.com/refrigerante.jpg', description: 'Refrigerante cola' },
    { name: 'Molho de Tomate', image: 'https://exemplo.com/molho.jpg', description: 'Molho de tomate tradicional' }
  ];

  // Mescla os produtos para alternar eletrônicos e alimentos
  const allProducts = [];
  for (let i = 0; i < 15; i++) {
    allProducts.push({ ...eletronicProducts[i], categoryId: 1 });
    allProducts.push({ ...foodProducts[i], categoryId: 2 });
  }

  // Insere os produtos alternando fornecedores e quantidades
  allProducts.forEach((p, i) => {
    const supplierId = (i % 2) + 1;
    const quantity = 10 + (i * 2) % 40; // Quantidade variada entre 10 e 49
    db.run(
      `INSERT INTO products (name, quantity, categoryId, supplierId, image, description) VALUES (?, ?, ?, ?, ?, ?)`,
      [p.name, quantity, p.categoryId, supplierId, p.image, p.description]
    );
  });

  // Popula estoque para os produtos
  for (let i = 1; i <= allProducts.length; i++) {
    db.run(
      `INSERT INTO stock (productId, type, quantity, date) VALUES (?, 'in', (SELECT quantity FROM products WHERE id = ?), datetime('now'))`,
      [i, i]
    );
  }
});

module.exports = db;
