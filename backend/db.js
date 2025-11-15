const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connected successfully!");
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        bio TEXT,
        avatar_url TEXT,
        user_level VARCHAR(50) DEFAULT 'Novice',
        points INTEGER DEFAULT 0,
        dark_mode BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrate existing users table
    await client.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS bio TEXT,
      ADD COLUMN IF NOT EXISTS avatar_url TEXT,
      ADD COLUMN IF NOT EXISTS user_level VARCHAR(50) DEFAULT 'Novice',
      ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
      ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        ingredients TEXT,
        instructions TEXT,
        category VARCHAR(100),
        tags VARCHAR(255),
        image_url TEXT,
        difficulty_level VARCHAR(20) DEFAULT 'Medium',
        cooking_time INTEGER,
        calories INTEGER,
        servings INTEGER DEFAULT 4,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrate existing recipes table
    await client.query(`
      ALTER TABLE recipes 
      ADD COLUMN IF NOT EXISTS description TEXT,
      ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20) DEFAULT 'Medium',
      ADD COLUMN IF NOT EXISTS cooking_time INTEGER,
      ADD COLUMN IF NOT EXISTS calories INTEGER,
      ADD COLUMN IF NOT EXISTS servings INTEGER DEFAULT 4;
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipe_likes (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(recipe_id, user_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipe_comments (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipe_ratings (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(recipe_id, user_id)
      );
    `);

    // New tables for enhanced features
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_follows (
        id SERIAL PRIMARY KEY,
        follower_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        following_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(follower_id, following_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipe_favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, recipe_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipe_views (
        id SERIAL PRIMARY KEY,
        recipe_id INTEGER REFERENCES recipes(id) ON DELETE CASCADE UNIQUE,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        requirement_type VARCHAR(50),
        requirement_value INTEGER
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(50),
        message TEXT,
        related_id INTEGER,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // ========== DATABASE TRIGGERS ==========

    // Trigger 2: Auto-update user points on recipe like
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_points_on_like()
      RETURNS TRIGGER AS $$
      DECLARE
        recipe_owner_id INTEGER;
      BEGIN
        SELECT user_id INTO recipe_owner_id FROM recipes WHERE id = NEW.recipe_id;
        UPDATE users SET points = points + 5 WHERE id = recipe_owner_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_points_on_like ON recipe_likes;
      CREATE TRIGGER trigger_points_on_like
      AFTER INSERT ON recipe_likes
      FOR EACH ROW
      EXECUTE FUNCTION update_user_points_on_like();
    `);

    // Trigger 3: Auto-update user points on recipe creation
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_points_on_recipe()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE users SET points = points + 10 WHERE id = NEW.user_id;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_points_on_recipe ON recipes;
      CREATE TRIGGER trigger_points_on_recipe
      AFTER INSERT ON recipes
      FOR EACH ROW
      EXECUTE FUNCTION update_user_points_on_recipe();
    `);

    // Trigger 4: Create notification on new comment
    await client.query(`
      CREATE OR REPLACE FUNCTION create_comment_notification()
      RETURNS TRIGGER AS $$
      DECLARE
        recipe_owner_id INTEGER;
        recipe_name VARCHAR(255);
        commenter_name VARCHAR(255);
      BEGIN
        SELECT user_id, name INTO recipe_owner_id, recipe_name FROM recipes WHERE id = NEW.recipe_id;
        SELECT username INTO commenter_name FROM users WHERE id = NEW.user_id;
        
        IF recipe_owner_id != NEW.user_id THEN
          INSERT INTO notifications (user_id, type, message, related_id)
          VALUES (
            recipe_owner_id,
            'comment',
            commenter_name || ' commented on your recipe "' || recipe_name || '"',
            NEW.recipe_id
          );
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_comment_notification ON recipe_comments;
      CREATE TRIGGER trigger_comment_notification
      AFTER INSERT ON recipe_comments
      FOR EACH ROW
      EXECUTE FUNCTION create_comment_notification();
    `);

    // Trigger 5: Auto-update user level based on points
    await client.query(`
      CREATE OR REPLACE FUNCTION update_user_level()
      RETURNS TRIGGER AS $$
      BEGIN
        IF NEW.points >= 500 THEN
          NEW.user_level = 'Master Chef';
        ELSIF NEW.points >= 200 THEN
          NEW.user_level = 'Chef';
        ELSIF NEW.points >= 50 THEN
          NEW.user_level = 'Amateur';
        ELSE
          NEW.user_level = 'Novice';
        END IF;
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_update_level ON users;
      CREATE TRIGGER trigger_update_level
      BEFORE UPDATE OF points ON users
      FOR EACH ROW
      EXECUTE FUNCTION update_user_level();
    `);

    // Trigger 6: Auto-award badges based on achievements
    await client.query(`
      CREATE OR REPLACE FUNCTION award_badges()
      RETURNS TRIGGER AS $$
      DECLARE
        recipe_count INTEGER;
        total_likes INTEGER;
        first_recipe_badge_id INTEGER;
        recipe_master_badge_id INTEGER;
        popular_badge_id INTEGER;
      BEGIN
        SELECT COUNT(*) INTO recipe_count FROM recipes WHERE user_id = NEW.id;
        SELECT COUNT(*) INTO total_likes FROM recipe_likes rl 
        JOIN recipes r ON rl.recipe_id = r.id WHERE r.user_id = NEW.id;
        
        -- Get badge IDs
        SELECT id INTO first_recipe_badge_id FROM badges WHERE name = 'First Recipe' LIMIT 1;
        SELECT id INTO recipe_master_badge_id FROM badges WHERE name = 'Recipe Master' LIMIT 1;
        SELECT id INTO popular_badge_id FROM badges WHERE name = 'Popular' LIMIT 1;
        
        -- First Recipe badge
        IF recipe_count >= 1 AND first_recipe_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, first_recipe_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        -- Recipe Master badge (20+ recipes)
        IF recipe_count >= 20 AND recipe_master_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, recipe_master_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        -- Popular badge (100+ likes)
        IF total_likes >= 100 AND popular_badge_id IS NOT NULL THEN
          INSERT INTO user_badges (user_id, badge_id)
          VALUES (NEW.id, popular_badge_id)
          ON CONFLICT DO NOTHING;
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS trigger_award_badges ON users;
      CREATE TRIGGER trigger_award_badges
      AFTER UPDATE OF points ON users
      FOR EACH ROW
      EXECUTE FUNCTION award_badges();
    `);

    // Insert default badges
    await client.query(`
      INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
      VALUES 
        ('First Recipe', 'Posted your first recipe!', '🍳', 'recipes_count', 1),
        ('5 Star Chef', 'Received a 5-star rating!', '⭐', 'five_star_rating', 1),
        ('Popular', 'Got 100 likes on your recipes!', '❤️', 'total_likes', 100),
        ('Social Butterfly', 'Following 10+ users!', '🦋', 'following_count', 10),
        ('Recipe Master', 'Posted 20+ recipes!', '👨‍🍳', 'recipes_count', 20)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log("✅ Database tables created/verified!");
    console.log("✅ Database triggers initialized!");
    client.release();
    
    // Seed database with sample data
    const seedDatabase = require('./seedDatabase');
    await seedDatabase();
    
  } catch (err) {
    console.error("❌ Database setup failed:", err.message);
  }
})();

module.exports = pool;
