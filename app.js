const express = require('express');
const app = express();
app.use(express.json());

let transactions = [];

// Create
app.post('/transactions', (req, res) => {
  const { amount, type, date, description } = req.body;
  const id = transactions.length + 1;
  transactions.push({ id, amount, type, date, description });
  res.send('Transaction added');
});

// Read
app.get('/transactions', (req, res) => {
  res.json(transactions);
});

// Update
app.put('/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const transaction = transactions.find(t => t.id === id);
  if (transaction) {
    Object.assign(transaction, req.body);
    res.send('Transaction updated');
  } else {
    res.status(404).send('Not found');
  }
});

// Delete
app.delete('/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  transactions = transactions.filter(t => t.id !== id);
  res.send('Transaction deleted');
});

app.listen(3000, () => console.log('Server running on port 3000'));
