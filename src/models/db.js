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
});

module.exports = db;
