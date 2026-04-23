require('./config/env');

const express = require('express');

const app = express();

app.listen(process.env.PORT, () => {
  console.log(`Servidor en puerto ${process.env.PORT}`);
});