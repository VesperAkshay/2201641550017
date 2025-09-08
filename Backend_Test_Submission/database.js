// In-memory storage (in production, use Redis or database)
const urlDatabase = new Map();
const clickDatabase = new Map();

module.exports = { urlDatabase, clickDatabase };