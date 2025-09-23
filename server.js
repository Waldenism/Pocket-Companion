const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
const cors = require('cors');
app.use(cors());

// Path to our JSON file
const DATA_FILE = path.join(__dirname, "decks.json");

// Utility: read JSON
function readData() {
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

// Utility: write JSON
function writeData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// --- ROUTES ---

app.get("/decks", (req, res) => {
  const decks = readData();
  res.json(decks);
});
// Get deck summaries (id + name only)
app.get("/decks/summary", (req, res) => {
  const decks = readData();
  const summaries = decks.map(d => ({ id: d.id, name: d.name }));
  res.json(summaries);
});

// Get single deck by ID
app.get("/decks/:id", (req, res) => {
  const decks = readData();
  const deck = decks.find((d) => d.id === req.params.id);
  if (deck) {
    res.json(deck);
  } else {
    res.status(404).json({ message: "Deck not found" });
  }
});

// Create new deck
app.post("/decks", (req, res) => {
  const decks = readData();
  const { name, cards } = req.body;

  if (!name || !Array.isArray(cards) || cards.length !== 20) {
    return res.status(400).json({ message: "Invalid deck format" });
  }

  const newDeck = {
    id: Date.now().toString(), // unique id
    name: name.trim(),
    cards,
  };

  decks.push(newDeck);
  writeData(decks);

  res.status(201).json(newDeck);
});

// Update a deck
app.put("/decks/:id", (req, res) => {
  const decks = readData();
  const index = decks.findIndex((d) => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: "Deck not found" });
  }

  const { name, cards } = req.body;

  if (!name || !Array.isArray(cards) || cards.length !== 20) {
    return res.status(400).json({ message: "Invalid deck format" });
  }

  decks[index] = { id: req.params.id, name, cards };
  writeData(decks);

  res.json(decks[index]);
});

// Delete a deck
app.delete("/decks/:id", (req, res) => {
  let decks = readData();
  const filtered = decks.filter((d) => d.id !== req.params.id);

  if (filtered.length === decks.length) {
    return res.status(404).json({ message: "Deck not found" });
  }

  writeData(filtered);
  res.json({ message: "Deck deleted" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
