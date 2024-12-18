const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Serveur de test fonctionne !');
});

app.listen(port, () => {
  console.log(`Serveur de test en écoute sur le port ${port}`);
});