const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET is not set in environment variables!");
}

// 🔹 Signup
router.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: "All fields are required" });

    const existing = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0)
      return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashed]
    );

    res.json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ error: "Signup failed" });
  }
});

// 🔹 Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const users = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (users.rows.length === 0)
      return res.status(400).json({ error: "Invalid email or password" });

    const user = users.rows[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid)
      return res.status(400).json({ error: "Invalid email or password" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// 🔹 Get user stats (for dashboard)
router.get("/stats", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    // Get user info
    const userResult = await db.query(
      "SELECT id, username, email, user_level, points, bio, avatar_url FROM users WHERE id = $1",
      [userId]
    );
    
    const user = userResult.rows[0];
    
    // Check if this is the demo account
    if (userEmail === 'gordon@demo.com') {
      // Return hardcoded impressive stats for demo account
      return res.json({
        ...user,
        recipes_count: 47,
        total_likes: 2843,
        avg_rating: 4.8,
        followers_count: 1256,
        total_views: 28934,
        total_comments: 892,
        total_saves: 1547,
        badges: [
          { name: 'First Recipe', icon: '🍳', description: 'Posted your first recipe!' },
          { name: '5 Star Chef', icon: '⭐', description: 'Received a 5-star rating!' },
          { name: 'Popular', icon: '❤️', description: 'Got 100 likes on your recipes!' },
          { name: 'Recipe Master', icon: '👨‍🍳', description: 'Posted 20+ recipes!' },
          { name: 'Social Butterfly', icon: '🦋', description: 'Following 10+ users!' }
        ],
        monthly: {
          recipes: 12,
          likes: 456,
          followers: 89
        }
      });
    }
    
    // For all other accounts, return actual stats (which will be 0 for new accounts)
    const recipesResult = await db.query(
      "SELECT COUNT(*) as count FROM recipes WHERE user_id = $1",
      [userId]
    );
    
    const likesResult = await db.query(
      `SELECT COUNT(*) as count FROM recipe_likes rl
       JOIN recipes r ON rl.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const ratingResult = await db.query(
      `SELECT AVG(rating) as avg FROM recipe_ratings rr
       JOIN recipes r ON rr.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const followersResult = await db.query(
      "SELECT COUNT(*) as count FROM user_follows WHERE following_id = $1",
      [userId]
    );
    
    const viewsResult = await db.query(
      `SELECT COALESCE(SUM(views), 0) as count FROM recipe_views
       WHERE recipe_id IN (SELECT id FROM recipes WHERE user_id = $1)`,
      [userId]
    );
    
    const commentsResult = await db.query(
      `SELECT COUNT(*) as count FROM recipe_comments rc
       JOIN recipes r ON rc.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const savesResult = await db.query(
      `SELECT COUNT(*) as count FROM recipe_favorites rf
       JOIN recipes r ON rf.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const badgesResult = await db.query(
      `SELECT b.name, b.icon, b.description FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1`,
      [userId]
    );
    
    const monthlyRecipes = await db.query(
      `SELECT COUNT(*) as count FROM recipes 
       WHERE user_id = $1 
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    
    const monthlyLikes = await db.query(
      `SELECT COUNT(*) as count FROM recipe_likes rl
       JOIN recipes r ON rl.recipe_id = r.id
       WHERE r.user_id = $1
       AND rl.created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    
    const monthlyFollowers = await db.query(
      `SELECT COUNT(*) as count FROM user_follows
       WHERE following_id = $1
       AND created_at >= DATE_TRUNC('month', CURRENT_DATE)`,
      [userId]
    );
    
    res.json({
      ...user,
      recipes_count: parseInt(recipesResult.rows[0].count),
      total_likes: parseInt(likesResult.rows[0].count),
      avg_rating: parseFloat(ratingResult.rows[0].avg) || 0,
      followers_count: parseInt(followersResult.rows[0].count),
      total_views: parseInt(viewsResult.rows[0].count),
      total_comments: parseInt(commentsResult.rows[0].count),
      total_saves: parseInt(savesResult.rows[0].count),
      badges: badgesResult.rows,
      monthly: {
        recipes: parseInt(monthlyRecipes.rows[0].count),
        likes: parseInt(monthlyLikes.rows[0].count),
        followers: parseInt(monthlyFollowers.rows[0].count)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// 🔹 Get user's top performing recipes
router.get("/top-recipes", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT r.id, r.name, r.image_url,
        COALESCE(rv.views, 0) as views,
        COUNT(DISTINCT rl.id) as likes,
        COALESCE(AVG(rr.rating), 0) as rating,
        COUNT(DISTINCT rc.id) as comments
       FROM recipes r
       LEFT JOIN recipe_views rv ON rv.recipe_id = r.id
       LEFT JOIN recipe_likes rl ON rl.recipe_id = r.id
       LEFT JOIN recipe_ratings rr ON rr.recipe_id = r.id
       LEFT JOIN recipe_comments rc ON rc.recipe_id = r.id
       WHERE r.user_id = $1
       GROUP BY r.id, r.name, r.image_url, rv.views
       ORDER BY views DESC, likes DESC
       LIMIT 10`,
      [userId]
    );
    
    res.json({ recipes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch top recipes" });
  }
});

// 🔹 Get user's activity timeline
router.get("/activity", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activities = [];
    
    // Recent recipes posted
    const recipesResult = await db.query(
      `SELECT 'recipe' as type, id, name as title, created_at 
       FROM recipes WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 5`,
      [userId]
    );
    
    // Recent likes received
    const likesResult = await db.query(
      `SELECT 'like' as type, r.name as title, rl.created_at
       FROM recipe_likes rl
       JOIN recipes r ON rl.recipe_id = r.id
       WHERE r.user_id = $1
       ORDER BY rl.created_at DESC LIMIT 5`,
      [userId]
    );
    
    // Recent comments received
    const commentsResult = await db.query(
      `SELECT 'comment' as type, r.name as title, rc.created_at
       FROM recipe_comments rc
       JOIN recipes r ON rc.recipe_id = r.id
       WHERE r.user_id = $1
       ORDER BY rc.created_at DESC LIMIT 5`,
      [userId]
    );
    
    // Recent badges earned
    const badgesResult = await db.query(
      `SELECT 'badge' as type, b.name as title, ub.earned_at as created_at
       FROM user_badges ub
       JOIN badges b ON ub.badge_id = b.id
       WHERE ub.user_id = $1
       ORDER BY ub.earned_at DESC LIMIT 5`,
      [userId]
    );
    
    // Combine and sort all activities
    const allActivities = [
      ...recipesResult.rows,
      ...likesResult.rows,
      ...commentsResult.rows,
      ...badgesResult.rows
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.json({ activities: allActivities.slice(0, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity" });
  }
});

// 🔹 Get chart data (views over time)
router.get("/chart-data", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Views over last 7 days - simulated since we don't track daily views
    // In a real app, you'd need a separate table to track views per day
    const totalViews = await db.query(
      `SELECT COALESCE(SUM(views), 0) as total FROM recipe_views
       WHERE recipe_id IN (SELECT id FROM recipes WHERE user_id = $1)`,
      [userId]
    );
    
    // Simulate 7-day view distribution (in production, you'd track this daily)
    const viewsData = [];
    const total = parseInt(totalViews.rows[0].total);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date().getDay();
    
    for (let i = 6; i >= 0; i--) {
      const dayIndex = (today - i + 7) % 7;
      const baseViews = Math.floor(total / 7);
      const randomVariation = Math.floor(Math.random() * (baseViews * 0.5));
      viewsData.push({
        date: days[dayIndex],
        views: Math.max(0, baseViews + randomVariation - (baseViews * 0.25))
      });
    }
    
    // Engagement distribution
    const likesCount = await db.query(
      `SELECT COUNT(*) as count FROM recipe_likes rl
       JOIN recipes r ON rl.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const commentsCount = await db.query(
      `SELECT COUNT(*) as count FROM recipe_comments rc
       JOIN recipes r ON rc.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    const savesCount = await db.query(
      `SELECT COUNT(*) as count FROM recipe_favorites rf
       JOIN recipes r ON rf.recipe_id = r.id
       WHERE r.user_id = $1`,
      [userId]
    );
    
    res.json({
      viewsOverTime: viewsData,
      engagement: {
        likes: parseInt(likesCount.rows[0].count),
        comments: parseInt(commentsCount.rows[0].count),
        saves: parseInt(savesCount.rows[0].count)
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chart data" });
  }
});

// 🔹 Get user's favorite recipes
router.get("/favorites", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.query(
      `SELECT r.*, u.username, 
        (SELECT COUNT(*) FROM recipe_likes WHERE recipe_id = r.id) as likes,
        (SELECT AVG(rating) FROM recipe_ratings WHERE recipe_id = r.id) as avgRating,
        (SELECT COUNT(*) FROM recipe_ratings WHERE recipe_id = r.id) as ratingsCount
       FROM recipe_favorites rf
       JOIN recipes r ON rf.recipe_id = r.id
       JOIN users u ON r.user_id = u.id
       WHERE rf.user_id = $1
       ORDER BY rf.created_at DESC`,
      [userId]
    );
    
    res.json({ favorites: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

// JWT verification middleware
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

module.exports = router;
