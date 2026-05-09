const router = require("express").Router();

const authMiddleware =
  require("../middleware/authMiddleware");

const upload =
  require("../middleware/uploadMiddleware");

const item =
  require("../controllers/itemController");

// GET
router.get(
  "/",
  authMiddleware,
  item.getAllItems
);

// CREATE
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  item.createItem
);
// UPDATE
router.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  item.updateItem
);

// DELETE
router.delete(
  "/:id",
  authMiddleware,
  item.deleteItem
);

module.exports = router;