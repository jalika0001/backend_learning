const fs = require("fs");
const path = require("path");
const { backupToGitHub } = require("../utils/githubBackup");

const filePath = path.join(__dirname, "../db/items.json");

// READ FILE
const getItems = () => {
  return JSON.parse(
    fs.readFileSync(filePath, "utf-8")
  );
};

// SAVE FILE
const saveItems = (data) => {
  fs.writeFileSync(
    filePath,
    JSON.stringify(data, null, 2)
  );
};

// GET ALL ITEMS
exports.getAllItems = (req, res) => {

  try {

    const items = getItems();

    const userItems = items.filter(
      item => item.userId === req.user.id
    );

    res.json(userItems);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// CREATE ITEM
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

      // image filename
      image: req.file
        ? req.file.filename
        : null,

      userId: req.user.id
    };

    items.push(newItem);

    saveItems(items);
    backupToGitHub("item-create");

    res.status(201).json(newItem);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// UPDATE ITEM
exports.updateItem = (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price required"
      });
    }

    const items = getItems();
    const itemIndex = items.findIndex(
      item => item.id === parseInt(id) && item.userId === req.user.id
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    items[itemIndex].name = name;
    items[itemIndex].price = price;

    if (req.file) {
      if (items[itemIndex].image) {
        const oldImagePath = path.join(__dirname, "../uploads", items[itemIndex].image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      items[itemIndex].image = req.file.filename;
    }

    saveItems(items);
    backupToGitHub("item-update");
    res.json(items[itemIndex]);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// DELETE ITEM
exports.deleteItem = (req, res) => {
  try {
    const { id } = req.params;

    const items = getItems();
    const itemIndex = items.findIndex(
      item => item.id === parseInt(id) && item.userId === req.user.id
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        message: "Item not found"
      });
    }

    if (items[itemIndex].image) {
      const imagePath = path.join(__dirname, "../uploads", items[itemIndex].image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    const deletedItem = items.splice(itemIndex, 1);
    saveItems(items);
    backupToGitHub("item-delete");

    res.json({
      message: "Item deleted successfully",
      item: deletedItem[0]
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};