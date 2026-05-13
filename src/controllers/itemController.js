const fs = require("fs");
const path = require("path");
const ITEMS_FILE_PATH = process.env.ITEMS_FILE_PATH || "src/db/items.json";
const { readJsonFile, writeJsonFile } = require("../utils/githubJsonStore");

// GET ALL ITEMS
exports.getAllItems = async (req, res) => {

  try {

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

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
exports.createItem = async (req, res) => {

  try {

    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price required"
      });
    }

    const items = await readJsonFile(ITEMS_FILE_PATH, []);

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

    await writeJsonFile(ITEMS_FILE_PATH, items, `items: create ${newItem.id}`);

    res.status(201).json(newItem);

  } catch (err) {

    console.log(err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

// UPDATE ITEM
exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        message: "Name and price required"
      });
    }

    const items = await readJsonFile(ITEMS_FILE_PATH, []);
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

    await writeJsonFile(ITEMS_FILE_PATH, items, `items: update ${items[itemIndex].id}`);
    res.json(items[itemIndex]);

  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

// DELETE ITEM
exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;

    const items = await readJsonFile(ITEMS_FILE_PATH, []);
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
    await writeJsonFile(ITEMS_FILE_PATH, items, `items: delete ${deletedItem[0].id}`);

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