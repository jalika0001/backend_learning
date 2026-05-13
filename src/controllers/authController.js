const dotenv = require("dotenv");
dotenv.config();

const SECRET = process.env.SECRET || "ngx123";
const USERS_FILE_PATH = process.env.USERS_FILE_PATH || "src/db/users.json";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readJsonFile, writeJsonFile } = require("../utils/githubJsonStore");

// REGISTER
exports.register = async (req, res) => {

  try {

    const { username, password } = req.body;

    // validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    const users = await readJsonFile(USERS_FILE_PATH, []);

    // check existing user
    const exist = users.find(
      u => u.username === username
    );

    if (exist) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // hash password
    const hash = await bcrypt.hash(password, 10);

    // create user
    const newUser = {
      id: Date.now(),
      username,
      password: hash
    };

    users.push(newUser);
    await writeJsonFile(USERS_FILE_PATH, users, `users: register ${newUser.username}`);

    // 🔥 CREATE TOKEN (IMPORTANT)
    const token = jwt.sign(
      {
        id: newUser.id,
        username: newUser.username
      },
      SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      message: "User created",
      token,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }
};

// LOGIN
exports.login = async (req, res) => {

  try {

    const { username, password } = req.body;

    // validation
    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password required"
      });
    }

    const users = await readJsonFile(USERS_FILE_PATH, []);

    // find user
    const user = users.find(
      u => u.username === username
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // compare password
    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {
      return res.status(401).json({
        message: "Wrong password"
      });
    }

    // generate token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username
      },
      SECRET,
      {
        expiresIn: "1h"
      }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username
      }
    });

  } catch (err) {

    res.status(500).json({
      message: "Server error"
    });

  }
};

//get only user data
exports.me = (req, res) => {
  try {
    res.json({
      message: "User data fetched successfully",
      user: req.user
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error"
    });
  }
};