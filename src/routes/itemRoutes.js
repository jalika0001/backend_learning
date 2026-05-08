const router = require("express").Router();
const authMiddleware = require("../middleware/authMiddleware");
const item = require("../controllers/itemController");

router.get("/", authMiddleware, item.getAllItems);
router.get("/:id", authMiddleware, item.getItemById);
router.post("/", authMiddleware, item.createItem);
router.put("/:id", authMiddleware, item.updateItem);
router.delete("/:id", authMiddleware, item.deleteItem);

module.exports = router;