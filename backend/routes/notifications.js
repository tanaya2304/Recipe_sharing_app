const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

function verifyToken(req, res, next) {
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ error: "No token provided" });

  const token = header.split(" ")[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = decoded;
    next();
  });
}

// 🔹 Get user notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );
    
    const unreadCount = await db.query(
      "SELECT COUNT(*) as count FROM notifications WHERE user_id = $1 AND is_read = false",
      [userId]
    );
    
    res.json({
      notifications: result.rows,
      unread_count: parseInt(unreadCount.rows[0].count)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// 🔹 Mark notifications as read
router.post("/read", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    await db.query(
      "UPDATE notifications SET is_read = true WHERE user_id = $1",
      [userId]
    );
    
    res.json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update notifications" });
  }
});

module.exports = router;
