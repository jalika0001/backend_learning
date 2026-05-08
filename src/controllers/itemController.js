const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "../db/items.json");

// READ FILE
const getItems = () => {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
};

// SAVE FILE
const saveItems = (data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};


exports.getAllItems = (req, res) => {

  try {

    const items = getItems();

    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const userItems = items.filter(
      item => item.userId === userId
    );

    res.json(userItems);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

exports.getItemById = (req, res) => {
  try {
    const items = getItems();

    const item = items.find(
      (i) => i.id === parseInt(req.params.id)
    );

    if (!item) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    res.json(item);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.createItem = (req, res) => {

  try {

    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price required"
      });
    }

    const items = getItems();

    const newItem = {
      id: Date.now(),
      name,
      price,
      userId: req.user.id   // 🔥 important
    };

    items.push(newItem);
    saveItems(items);

    res.status(201).json(newItem);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateItem = (req, res) => {
  try {
    const items = getItems();

    const index = items.findIndex(
      (i) => i.id === parseInt(req.params.id)
    );

    if (index === -1) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    items[index] = {
      ...items[index],
      ...req.body
    };

    saveItems(items);

    res.json(items[index]);

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteItem = (req, res) => {
  try {
    const items = getItems();

    const newItems = items.filter(
      (i) => i.id !== parseInt(req.params.id)
    );

    if (items.length === newItems.length) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    saveItems(newItems);

    res.json({
      message: "Item deleted"
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};