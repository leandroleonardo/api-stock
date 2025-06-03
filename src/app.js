const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const stockRoutes = require('./routes/stock.routes');

const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);
app.use('/categories', categoryRoutes);
app.use('/stock', stockRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.get('/', (req, res) => res.send('API de Controle de Estoque'));

module.exports = app;
