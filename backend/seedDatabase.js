const db = require('./db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Check if data already exists
    const existingUsers = await db.query('SELECT COUNT(*) FROM users');
    if (parseInt(existingUsers.rows[0].count) > 3) {
      console.log('✅ Database already has data. Skipping seed.');
      return;
    }

    // Create sample badges first
    await db.query(`
      INSERT INTO badges (name, description, icon, requirement_type, requirement_value)
      VALUES 
        ('First Recipe', 'Posted your first recipe', '🍳', 'recipes_count', 1),
        ('Rising Star', 'Received 50 likes', '⭐', 'total_likes', 50),
        ('Master Chef', 'Posted 20 recipes', '👨‍🍳', 'recipes_count', 20),
        ('Community Favorite', 'Received 100 likes', '❤️', 'total_likes', 100),
        ('Culinary Legend', 'Reached 500 total views', '🏆', 'total_views', 500)
      ON CONFLICT (name) DO NOTHING
    `);

    // Hash the demo password
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create demo users
    const demoUsers = [
      { username: 'GordonChef', email: 'gordon@demo.com', password: hashedPassword, level: 'Master Chef', points: 450 },
      { username: 'JuliaCooks', email: 'julia@demo.com', password: hashedPassword, level: 'Rising Star', points: 280 },
      { username: 'JamieFoodie', email: 'jamie@demo.com', password: hashedPassword, level: 'Home Cook', points: 150 }
    ];

    const userIds = [];
    for (const user of demoUsers) {
      const result = await db.query(
        `INSERT INTO users (username, email, password, user_level, points, bio, avatar_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET password = $3, user_level = $4, points = $5
         RETURNING id`,
        [
          user.username,
          user.email,
          user.password,
          user.level,
          user.points,
          `Passionate chef sharing delicious recipes! 🍽️`,
          `https://ui-avatars.com/api/?name=${user.username}&background=random`
        ]
      );
      userIds.push(result.rows[0].id);
    }

    console.log('✅ Created demo users');

    // Create sample recipes
    const recipes = [
      { name: 'Spaghetti Carbonara', category: 'Italian', difficulty: 'Easy', time: 30, userId: 0 },
      { name: 'Chicken Tikka Masala', category: 'Indian', difficulty: 'Medium', time: 45, userId: 0 },
      { name: 'French Onion Soup', category: 'French', difficulty: 'Medium', time: 60, userId: 0 },
      { name: 'Classic Margherita Pizza', category: 'Italian', difficulty: 'Easy', time: 25, userId: 0 },
      { name: 'Beef Wellington', category: 'British', difficulty: 'Hard', time: 120, userId: 0 },
      { name: 'Pad Thai', category: 'Thai', difficulty: 'Medium', time: 35, userId: 1 },
      { name: 'Caesar Salad', category: 'American', difficulty: 'Easy', time: 15, userId: 1 },
      { name: 'Chocolate Lava Cake', category: 'Dessert', difficulty: 'Medium', time: 40, userId: 1 },
      { name: 'Tacos Al Pastor', category: 'Mexican', difficulty: 'Medium', time: 50, userId: 2 },
      { name: 'Sushi Rolls', category: 'Japanese', difficulty: 'Hard', time: 90, userId: 2 },
    ];

    const recipeIds = [];
    for (const recipe of recipes) {
      const result = await db.query(
        `INSERT INTO recipes (name, description, ingredients, instructions, category, difficulty_level, cooking_time, servings, user_id, image_url)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          recipe.name,
          `A delicious ${recipe.name} recipe that will wow your taste buds! Perfect for any occasion.`,
          JSON.stringify(['Ingredient 1', 'Ingredient 2', 'Ingredient 3', 'Ingredient 4', 'Ingredient 5']),
          JSON.stringify(['Step 1: Prepare ingredients', 'Step 2: Cook', 'Step 3: Serve hot']),
          recipe.category,
          recipe.difficulty,
          recipe.time,
          4,
          userIds[recipe.userId],
          `https://source.unsplash.com/800x600/?${recipe.name.replace(/\s/g, '-')}`
        ]
      );
      recipeIds.push(result.rows[0].id);
    }

    console.log('✅ Created sample recipes');

    // Add likes to recipes
    for (let i = 0; i < recipeIds.length; i++) {
      const likesCount = Math.floor(Math.random() * 50) + 10;
      for (let j = 0; j < Math.min(likesCount, userIds.length); j++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        await db.query(
          `INSERT INTO recipe_likes (user_id, recipe_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, recipe_id) DO NOTHING`,
          [randomUser, recipeIds[i]]
        );
      }
    }

    console.log('✅ Added recipe likes');

    // Add ratings to recipes
    for (let i = 0; i < recipeIds.length; i++) {
      for (let j = 0; j < userIds.length; j++) {
        const rating = Math.floor(Math.random() * 2) + 4; // 4 or 5 stars
        await db.query(
          `INSERT INTO recipe_ratings (user_id, recipe_id, rating)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id, recipe_id) DO UPDATE SET rating = $3`,
          [userIds[j], recipeIds[i], rating]
        );
      }
    }

    console.log('✅ Added recipe ratings');

    // Add views to recipes
    for (let i = 0; i < recipeIds.length; i++) {
      const viewsCount = Math.floor(Math.random() * 200) + 50;
      await db.query(
        `INSERT INTO recipe_views (recipe_id, views)
         VALUES ($1, $2)
         ON CONFLICT (recipe_id) DO UPDATE SET views = recipe_views.views + $2`,
        [recipeIds[i], viewsCount]
      );
    }

    console.log('✅ Added recipe views');

    // Add comments to recipes
    const sampleComments = [
      'Absolutely delicious! Made this for dinner tonight.',
      'Easy to follow recipe, turned out great!',
      'My family loved this dish!',
      'Will definitely make this again!',
      'Best recipe I\'ve tried so far!',
    ];

    for (let i = 0; i < recipeIds.length; i++) {
      const commentsCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < commentsCount; j++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
        await db.query(
          `INSERT INTO recipe_comments (user_id, recipe_id, comment)
           VALUES ($1, $2, $3)`,
          [randomUser, recipeIds[i], randomComment]
        );
      }
    }

    console.log('✅ Added recipe comments');

    // Add favorites
    for (let i = 0; i < recipeIds.length; i++) {
      const favCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < favCount; j++) {
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        await db.query(
          `INSERT INTO recipe_favorites (user_id, recipe_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, recipe_id) DO NOTHING`,
          [randomUser, recipeIds[i]]
        );
      }
    }

    console.log('✅ Added recipe favorites');

    // Add user follows
    for (let i = 0; i < userIds.length; i++) {
      for (let j = 0; j < userIds.length; j++) {
        if (i !== j) {
          await db.query(
            `INSERT INTO user_follows (follower_id, following_id)
             VALUES ($1, $2)
             ON CONFLICT (follower_id, following_id) DO NOTHING`,
            [userIds[i], userIds[j]]
          );
        }
      }
    }

    console.log('✅ Added user follows');

    // Assign badges to users
    const badges = await db.query('SELECT id FROM badges');
    for (let i = 0; i < userIds.length; i++) {
      const badgeCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < badgeCount; j++) {
        await db.query(
          `INSERT INTO user_badges (user_id, badge_id)
           VALUES ($1, $2)
           ON CONFLICT (user_id, badge_id) DO NOTHING`,
          [userIds[i], badges.rows[j].id]
        );
      }
    }

    console.log('✅ Assigned badges to users');
    console.log('🎉 Database seeding completed successfully!');

  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
}

module.exports = seedDatabase;
