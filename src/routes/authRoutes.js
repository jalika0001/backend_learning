const router = require("express").Router();
const auth = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");


router.post("/register", auth.register);
router.post("/login", auth.login);

// protected user route
router.get("/me", authMiddleware, auth.me);

module.exports = router;