const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET is not set in environment variables!");
}

// 🔹 Verify JWT middleware
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

// 🔹 Get all recipes
router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT r.*, u.username as author_name 
      FROM recipes r 
      LEFT JOIN users u ON r.user_id = u.id 
      ORDER BY r.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// 🔹 Add recipe
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, ingredients, instructions, category, tags, image_url, difficulty, cook_time, calories, servings } = req.body;
    const userId = req.user.id;

    const result = await db.query(
      `INSERT INTO recipes 
        (user_id, name, ingredients, instructions, category, tags, image_url, difficulty_level, cooking_time, calories, servings)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
      [userId, name, ingredients, instructions, category, tags, image_url || '🍽️', difficulty || 'Medium', cook_time || 30, calories || 0, servings || 4]
    );

    res.json({ message: "Recipe added successfully!", recipeId: result.rows[0].id });
  } catch (err) {
    console.error("Error inserting recipe:", err);
    res.status(500).json({ error: "Failed to add recipe" });
  }
});


// 🔹 Like / Unlike recipe
router.post("/:id/like", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await db.query(
      "SELECT * FROM recipe_likes WHERE recipe_id=$1 AND user_id=$2",
      [recipeId, userId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "DELETE FROM recipe_likes WHERE recipe_id=$1 AND user_id=$2",
        [recipeId, userId]
      );
    } else {
      await db.query(
        "INSERT INTO recipe_likes (recipe_id, user_id) VALUES ($1, $2)",
        [recipeId, userId]
      );
    }

    const likesCount = await db.query(
      "SELECT COUNT(*) AS count FROM recipe_likes WHERE recipe_id=$1",
      [recipeId]
    );

    res.json({ likesCount: parseInt(likesCount.rows[0].count) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Like failed" });
  }
});

// 🔹 Add comment
router.post("/:id/comment", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { comment } = req.body;

  try {
    await db.query(
      "INSERT INTO recipe_comments (recipe_id, user_id, comment) VALUES ($1, $2, $3)",
      [recipeId, userId, comment]
    );

    const comments = await db.query(
      `SELECT c.id, c.comment, u.username, c.created_at 
       FROM recipe_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE recipe_id = $1 
       ORDER BY c.created_at DESC`,
      [recipeId]
    );

    res.json({ comments: comments.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Comment failed" });
  }
});

// 🔹 Add / update rating
router.post("/:id/rate", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { rating } = req.body;

  try {
    const existing = await db.query(
      "SELECT * FROM recipe_ratings WHERE recipe_id=$1 AND user_id=$2",
      [recipeId, userId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "UPDATE recipe_ratings SET rating=$1 WHERE recipe_id=$2 AND user_id=$3",
        [rating, recipeId, userId]
      );
    } else {
      await db.query(
        "INSERT INTO recipe_ratings (recipe_id, user_id, rating) VALUES ($1, $2, $3)",
        [recipeId, userId, rating]
      );
    }

    const avgRating = await db.query(
      "SELECT AVG(rating) AS avgrating, COUNT(*) AS ratingscount FROM recipe_ratings WHERE recipe_id=$1",
      [recipeId]
    );

    res.json({
      avgRating: parseFloat(avgRating.rows[0].avgrating),
      ratingsCount: parseInt(avgRating.rows[0].ratingscount),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rating failed" });
  }
});

// 🔹 Search recipes by ingredients or name
router.get("/search", async (req, res) => {
  try {
    const { ingredients, name } = req.query;

    let query = "SELECT * FROM recipes WHERE 1=1";
    const params = [];
    let paramCount = 1;

    if (name) {
      query += ` AND name ILIKE $${paramCount}`;
      params.push(`%${name}%`);
      paramCount++;
    }

    if (ingredients) {
      const ingredientList = ingredients.split(",").map(i => i.trim());
      ingredientList.forEach(ing => {
        query += ` AND ingredients ILIKE $${paramCount}`;
        params.push(`%${ing}%`);
        paramCount++;
      });
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error searching recipes:", err);
    res.status(500).json({ error: "Search failed" });
  }
});


// 🔹 Track recipe view
router.post("/:id/view", verifyToken, async (req, res) => {
  const recipeId = req.params.id;

  try {
    await db.query(
      `INSERT INTO recipe_views (recipe_id, views) VALUES ($1, 1)
       ON CONFLICT (recipe_id) 
       DO UPDATE SET views = recipe_views.views + 1`,
      [recipeId]
    );
    
    res.json({ message: "View tracked" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to track view" });
  }
});

// 🔹 Toggle favorite
router.post("/:id/favorite", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const existing = await db.query(
      "SELECT * FROM recipe_favorites WHERE user_id=$1 AND recipe_id=$2",
      [userId, recipeId]
    );

    if (existing.rows.length > 0) {
      await db.query(
        "DELETE FROM recipe_favorites WHERE user_id=$1 AND recipe_id=$2",
        [userId, recipeId]
      );
      res.json({ message: "Removed from favorites" });
    } else {
      await db.query(
        "INSERT INTO recipe_favorites (user_id, recipe_id) VALUES ($1, $2)",
        [userId, recipeId]
      );
      res.json({ message: "Added to favorites!" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update favorites" });
  }
});

// 🔹 Get comments for a recipe
router.get("/:id/comments", async (req, res) => {
  const recipeId = req.params.id;

  try {
    const result = await db.query(
      `SELECT c.id, c.comment, u.username, c.created_at 
       FROM recipe_comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE recipe_id = $1 
       ORDER BY c.created_at DESC`,
      [recipeId]
    );

    res.json({ comments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

// 🔹 Get recipe analytics
router.get("/:id/analytics", verifyToken, async (req, res) => {
  const recipeId = req.params.id;

  try {
    const recipe = await db.query("SELECT * FROM recipes WHERE id = $1", [recipeId]);
    if (recipe.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    const viewsCount = await db.query(
      "SELECT COALESCE(views, 0) as count FROM recipe_views WHERE recipe_id = $1",
      [recipeId]
    );

    const likesCount = await db.query(
      "SELECT COUNT(*) as count FROM recipe_likes WHERE recipe_id = $1",
      [recipeId]
    );

    const commentsCount = await db.query(
      "SELECT COUNT(*) as count FROM recipe_comments WHERE recipe_id = $1",
      [recipeId]
    );

    const avgRating = await db.query(
      "SELECT AVG(rating) as avg, COUNT(*) as count FROM recipe_ratings WHERE recipe_id = $1",
      [recipeId]
    );

    res.json({
      recipe: recipe.rows[0],
      analytics: {
        total_views: viewsCount.rows.length > 0 ? parseInt(viewsCount.rows[0].count) : 0,
        total_likes: parseInt(likesCount.rows[0].count),
        total_comments: parseInt(commentsCount.rows[0].count),
        avg_rating: parseFloat(avgRating.rows[0].avg) || 0,
        ratings_count: parseInt(avgRating.rows[0].count),
        views_over_time: []
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// 🔹 Edit recipe
router.put("/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;
  const { name, ingredients, instructions, category, tags, image_url, difficulty, cook_time, calories, servings } = req.body;

  try {
    const recipe = await db.query("SELECT user_id FROM recipes WHERE id = $1", [recipeId]);
    if (recipe.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    if (recipe.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to edit this recipe" });
    }

    await db.query(
      `UPDATE recipes 
       SET name=$1, ingredients=$2, instructions=$3, category=$4, tags=$5, 
           image_url=$6, difficulty=$7, cook_time=$8, calories=$9, servings=$10
       WHERE id=$11`,
      [name, ingredients, instructions, category, tags, image_url, difficulty, cook_time, calories, servings, recipeId]
    );

    res.json({ message: "Recipe updated successfully!" });
  } catch (err) {
    console.error("Error updating recipe:", err);
    res.status(500).json({ error: "Failed to update recipe" });
  }
});

// 🔹 Delete recipe
router.delete("/:id", verifyToken, async (req, res) => {
  const recipeId = req.params.id;
  const userId = req.user.id;

  try {
    const recipe = await db.query("SELECT user_id FROM recipes WHERE id = $1", [recipeId]);
    if (recipe.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }
    if (recipe.rows[0].user_id !== userId) {
      return res.status(403).json({ error: "Not authorized to delete this recipe" });
    }

    await db.query("DELETE FROM recipes WHERE id = $1", [recipeId]);
    res.json({ message: "Recipe deleted successfully!" });
  } catch (err) {
    console.error("Error deleting recipe:", err);
    res.status(500).json({ error: "Failed to delete recipe" });
  }
});

module.exports = router;
