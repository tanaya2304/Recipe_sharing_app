require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcryptjs');

const sampleRecipes = [
  {
    name: "Classic Margherita Pizza",
    ingredients: "Pizza dough, Fresh mozzarella, San Marzano tomatoes, Fresh basil leaves, Extra virgin olive oil, Sea salt, Garlic cloves",
    instructions: "Preheat oven to 500°F with pizza stone. Roll out dough to 12-inch circle. Spread crushed tomatoes, add torn mozzarella. Bake for 10-12 minutes until crust is golden and cheese bubbles. Garnish with fresh basil and drizzle olive oil.",
    category: "Italian",
    tags: "Veg, Quick, Classic",
    image_url: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600",
    difficulty: "Easy",
    cook_time: 20,
    calories: 650,
    servings: 4
  },
  {
    name: "Creamy Tuscan Chicken",
    ingredients: "Chicken breasts, Heavy cream, Sun-dried tomatoes, Fresh spinach, Garlic, Italian seasoning, Parmesan cheese, Butter",
    instructions: "Season chicken with salt and pepper. Sear in hot pan until golden. Remove and sauté garlic, add sun-dried tomatoes. Pour in cream, add spinach and parmesan. Return chicken to pan, simmer 10 minutes. Serve over pasta or rice.",
    category: "Italian",
    tags: "Non-Veg, Healthy, Dinner",
    image_url: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600",
    difficulty: "Medium",
    cook_time: 35,
    calories: 520,
    servings: 4
  },
  {
    name: "Avocado Toast Deluxe",
    ingredients: "Sourdough bread, Ripe avocados, Cherry tomatoes, Feta cheese, Everything bagel seasoning, Lemon juice, Red pepper flakes, Extra virgin olive oil",
    instructions: "Toast bread until golden. Mash avocado with lemon juice, salt, and pepper. Spread on toast. Top with halved cherry tomatoes, crumbled feta, bagel seasoning, and red pepper flakes. Drizzle with olive oil.",
    category: "American",
    tags: "Veg, Quick, Breakfast, Healthy",
    image_url: "https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=600",
    difficulty: "Easy",
    cook_time: 10,
    calories: 340,
    servings: 2
  },
  {
    name: "Pad Thai with Shrimp",
    ingredients: "Rice noodles, Shrimp, Bean sprouts, Eggs, Peanuts, Tamarind paste, Fish sauce, Palm sugar, Garlic, Lime, Scallions",
    instructions: "Soak noodles in warm water. Make sauce with tamarind, fish sauce, and sugar. Stir-fry shrimp, set aside. Scramble eggs, add drained noodles and sauce. Toss with shrimp, bean sprouts. Garnish with peanuts, lime, and scallions.",
    category: "Thai",
    tags: "Non-Veg, Authentic, Dinner",
    image_url: "https://images.unsplash.com/photo-1559314809-0d155014e29e?w=600",
    difficulty: "Medium",
    cook_time: 30,
    calories: 480,
    servings: 4
  },
  {
    name: "Mediterranean Quinoa Bowl",
    ingredients: "Quinoa, Cucumber, Cherry tomatoes, Kalamata olives, Red onion, Feta cheese, Chickpeas, Lemon, Olive oil, Fresh parsley, Oregano",
    instructions: "Cook quinoa according to package. Let cool. Dice cucumber, tomatoes, onion. Combine all ingredients in large bowl. Make dressing with olive oil, lemon juice, oregano. Toss everything together, top with feta and parsley.",
    category: "Mediterranean",
    tags: "Veg, Healthy, Vegan-Option, Lunch",
    image_url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
    difficulty: "Easy",
    cook_time: 25,
    calories: 420,
    servings: 4
  },
  {
    name: "Japanese Ramen Bowl",
    ingredients: "Ramen noodles, Pork belly, Soft-boiled eggs, Nori seaweed, Scallions, Corn kernels, Menma bamboo shoots, Miso paste, Chicken broth, Garlic, Ginger",
    instructions: "Simmer broth with miso, garlic, and ginger for 30 minutes. Cook noodles separately. Slice and sear pork belly until crispy. Assemble bowls with noodles, hot broth, pork, halved eggs, nori, scallions, corn, and bamboo shoots.",
    category: "Japanese",
    tags: "Non-Veg, Comfort Food, Dinner",
    image_url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=600",
    difficulty: "Hard",
    cook_time: 60,
    calories: 680,
    servings: 4
  },
  {
    name: "Berry Smoothie Bowl",
    ingredients: "Frozen mixed berries, Banana, Greek yogurt, Almond milk, Honey, Granola, Fresh berries, Chia seeds, Coconut flakes, Almond butter",
    instructions: "Blend frozen berries, banana, yogurt, and almond milk until thick and creamy. Pour into bowl. Top with granola, fresh berries, chia seeds, coconut flakes, and a drizzle of almond butter. Serve immediately.",
    category: "American",
    tags: "Veg, Quick, Breakfast, Healthy",
    image_url: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600",
    difficulty: "Easy",
    cook_time: 5,
    calories: 380,
    servings: 2
  },
  {
    name: "Beef Tacos with Guacamole",
    ingredients: "Ground beef, Taco shells, Avocados, Lime, Cilantro, Tomatoes, Onion, Lettuce, Cheddar cheese, Sour cream, Cumin, Chili powder",
    instructions: "Brown beef with cumin and chili powder. Make guacamole by mashing avocados with lime, cilantro, diced tomatoes. Warm taco shells. Fill with seasoned beef, lettuce, cheese, guacamole, and sour cream. Serve immediately.",
    category: "Mexican",
    tags: "Non-Veg, Quick, Dinner",
    image_url: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600",
    difficulty: "Easy",
    cook_time: 20,
    calories: 540,
    servings: 4
  },
  {
    name: "Vegan Buddha Bowl",
    ingredients: "Brown rice, Roasted sweet potato, Chickpeas, Kale, Purple cabbage, Tahini, Lemon, Maple syrup, Garlic, Sesame seeds, Avocado",
    instructions: "Cook brown rice. Roast cubed sweet potato at 400°F for 25 minutes. Crisp chickpeas in pan. Massage kale with lemon. Make tahini dressing with tahini, lemon, maple syrup, garlic. Assemble bowls with all components and drizzle with dressing.",
    category: "American",
    tags: "Vegan, Healthy, Lunch, Gluten-Free",
    image_url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
    difficulty: "Medium",
    cook_time: 40,
    calories: 460,
    servings: 4
  },
  {
    name: "Crispy Fried Chicken",
    ingredients: "Chicken pieces, Buttermilk, All-purpose flour, Cornstarch, Paprika, Garlic powder, Cayenne pepper, Salt, Black pepper, Vegetable oil",
    instructions: "Marinate chicken in buttermilk for 2 hours. Mix flour with spices. Coat chicken thoroughly. Heat oil to 350°F. Fry chicken in batches for 12-15 minutes until golden and internal temp reaches 165°F. Drain on paper towels.",
    category: "American",
    tags: "Non-Veg, Comfort Food, Dinner",
    image_url: "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=600",
    difficulty: "Medium",
    cook_time: 45,
    calories: 720,
    servings: 6
  },
  {
    name: "Caprese Salad",
    ingredients: "Fresh mozzarella, Heirloom tomatoes, Fresh basil, Balsamic glaze, Extra virgin olive oil, Sea salt, Cracked black pepper",
    instructions: "Slice mozzarella and tomatoes into 1/4-inch rounds. Arrange alternating on plate. Tuck basil leaves between slices. Drizzle with olive oil and balsamic glaze. Season with sea salt and cracked pepper. Serve at room temperature.",
    category: "Italian",
    tags: "Veg, Quick, Healthy, Appetizer",
    image_url: "https://images.unsplash.com/photo-1592417817098-8fd3d9eb14a5?w=600",
    difficulty: "Easy",
    cook_time: 10,
    calories: 280,
    servings: 4
  },
  {
    name: "Chicken Tikka Masala",
    ingredients: "Chicken thighs, Yogurt, Garam masala, Turmeric, Cumin, Tomato sauce, Heavy cream, Ginger, Garlic, Onion, Cilantro, Butter, Basmati rice",
    instructions: "Marinate chicken in yogurt and spices for 1 hour. Grill or broil until charred. Sauté onion, ginger, garlic. Add tomatoes and spices, simmer. Add cream and butter. Add chicken pieces. Simmer 15 minutes. Serve over rice with cilantro.",
    category: "Indian",
    tags: "Non-Veg, Spicy, Dinner",
    image_url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600",
    difficulty: "Hard",
    cook_time: 75,
    calories: 620,
    servings: 6
  },
  {
    name: "Greek Moussaka",
    ingredients: "Eggplant, Ground lamb, Onion, Tomatoes, Cinnamon, Red wine, Potatoes, Béchamel sauce, Parmesan cheese, Nutmeg, Olive oil",
    instructions: "Slice and roast eggplant and potatoes. Brown lamb with onion, add tomatoes, wine, cinnamon. Layer potatoes, then eggplant, then meat sauce in baking dish. Top with béchamel and parmesan. Bake at 350°F for 45 minutes until golden.",
    category: "Greek",
    tags: "Non-Veg, Comfort Food, Dinner",
    image_url: "https://images.unsplash.com/photo-1601001815894-4bb6c81416d7?w=600",
    difficulty: "Hard",
    cook_time: 90,
    calories: 680,
    servings: 8
  },
  {
    name: "Korean Bibimbap",
    ingredients: "White rice, Beef bulgogi, Spinach, Bean sprouts, Carrots, Mushrooms, Zucchini, Kimchi, Fried egg, Gochujang sauce, Sesame oil, Sesame seeds",
    instructions: "Cook rice. Marinate and cook beef bulgogi. Blanch spinach and bean sprouts. Sauté carrots, mushrooms, and zucchini separately. Arrange rice in bowl, top with all vegetables, beef, kimchi, and fried egg. Serve with gochujang sauce and sesame oil.",
    category: "Korean",
    tags: "Non-Veg, Healthy, Lunch",
    image_url: "https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=600",
    difficulty: "Medium",
    cook_time: 50,
    calories: 580,
    servings: 4
  },
  {
    name: "French Croissants",
    ingredients: "All-purpose flour, Butter, Milk, Yeast, Sugar, Salt, Egg wash",
    instructions: "Mix dough with flour, milk, yeast, sugar, salt. Refrigerate overnight. Roll out dough, layer with cold butter, fold multiple times. Chill between folds. Cut into triangles, roll into croissant shape. Proof until doubled. Brush with egg wash. Bake at 400°F for 20 minutes.",
    category: "French",
    tags: "Veg, Breakfast, Pastry",
    image_url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
    difficulty: "Hard",
    cook_time: 120,
    calories: 420,
    servings: 12
  },
  {
    name: "Caesar Salad with Grilled Chicken",
    ingredients: "Romaine lettuce, Chicken breast, Parmesan cheese, Croutons, Caesar dressing, Garlic, Anchovies, Lemon, Olive oil, Dijon mustard, Egg yolk",
    instructions: "Grill seasoned chicken breast. Make dressing by blending garlic, anchovies, lemon, olive oil, mustard, egg yolk, and parmesan. Tear romaine into bite-sized pieces. Toss with dressing. Top with sliced chicken, croutons, and extra parmesan.",
    category: "American",
    tags: "Non-Veg, Healthy, Lunch",
    image_url: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=600",
    difficulty: "Easy",
    cook_time: 25,
    calories: 450,
    servings: 4
  },
  {
    name: "Chocolate Lava Cake",
    ingredients: "Dark chocolate, Butter, Eggs, Sugar, All-purpose flour, Vanilla extract, Powdered sugar, Ice cream",
    instructions: "Melt chocolate and butter together. Whisk eggs and sugar until thick. Fold in chocolate mixture and flour. Pour into greased ramekins. Bake at 425°F for 12-14 minutes until edges are set but center jiggles. Invert onto plates. Dust with powdered sugar. Serve with ice cream.",
    category: "French",
    tags: "Veg, Dessert, Sweet",
    image_url: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600",
    difficulty: "Medium",
    cook_time: 30,
    calories: 520,
    servings: 4
  },
  {
    name: "Vegetable Stir Fry",
    ingredients: "Broccoli, Bell peppers, Snap peas, Carrots, Mushrooms, Garlic, Ginger, Soy sauce, Sesame oil, Cornstarch, Vegetable oil, Rice",
    instructions: "Cook rice. Cut vegetables into bite-sized pieces. Heat wok with oil. Stir-fry garlic and ginger. Add vegetables in order of cooking time (carrots first, then broccoli, peppers, snap peas, mushrooms). Add soy sauce and sesame oil. Thicken with cornstarch slurry. Serve over rice.",
    category: "Chinese",
    tags: "Veg, Quick, Healthy, Vegan",
    image_url: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=600",
    difficulty: "Easy",
    cook_time: 20,
    calories: 320,
    servings: 4
  },
  {
    name: "Eggs Benedict",
    ingredients: "English muffins, Canadian bacon, Eggs, Butter, Lemon juice, White vinegar, Chives, Paprika",
    instructions: "Make hollandaise: whisk egg yolks with lemon juice over double boiler, slowly add melted butter until thick. Toast English muffins. Pan-fry Canadian bacon. Poach eggs in simmering water with vinegar for 3-4 minutes. Assemble: muffin, bacon, poached egg, hollandaise. Garnish with chives and paprika.",
    category: "American",
    tags: "Non-Veg, Breakfast, Brunch",
    image_url: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=600",
    difficulty: "Hard",
    cook_time: 30,
    calories: 480,
    servings: 4
  },
  {
    name: "Pesto Pasta with Cherry Tomatoes",
    ingredients: "Pasta, Fresh basil, Pine nuts, Parmesan, Garlic, Olive oil, Cherry tomatoes, Lemon, Salt, Black pepper",
    instructions: "Cook pasta al dente. Make pesto by blending basil, pine nuts, parmesan, garlic, and olive oil. Halve cherry tomatoes, sauté briefly. Toss hot pasta with pesto. Add cherry tomatoes. Finish with lemon zest, extra parmesan, and black pepper. Serve immediately.",
    category: "Italian",
    tags: "Veg, Quick, Dinner",
    image_url: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600",
    difficulty: "Easy",
    cook_time: 20,
    calories: 520,
    servings: 4
  },
  {
    name: "Beef Pho",
    ingredients: "Rice noodles, Beef bones, Star anise, Cinnamon, Ginger, Onion, Fish sauce, Beef sirloin, Bean sprouts, Thai basil, Lime, Jalapeño, Hoisin sauce",
    instructions: "Char ginger and onion. Simmer beef bones with star anise, cinnamon for 6-8 hours. Strain broth, season with fish sauce. Cook rice noodles. Slice beef paper-thin. Assemble bowls: noodles, raw beef slices, hot broth (cooks the beef), bean sprouts, basil, lime, jalapeño. Serve with hoisin and sriracha.",
    category: "Vietnamese",
    tags: "Non-Veg, Comfort Food, Soup",
    image_url: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=600",
    difficulty: "Hard",
    cook_time: 480,
    calories: 520,
    servings: 6
  },
  {
    name: "Spanish Paella",
    ingredients: "Bomba rice, Chicken thighs, Chorizo, Shrimp, Mussels, Peas, Bell peppers, Saffron, Chicken stock, Onion, Garlic, Paprika, Lemon",
    instructions: "Sauté chicken and chorizo in paella pan. Add onion, garlic, peppers. Stir in rice and paprika. Add saffron-infused stock. Arrange seafood on top. Cook without stirring for 20 minutes until rice forms socarrat (crispy bottom). Add peas, let rest 5 minutes. Serve with lemon wedges.",
    category: "Spanish",
    tags: "Non-Veg, Seafood, Dinner",
    image_url: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=600",
    difficulty: "Hard",
    cook_time: 60,
    calories: 640,
    servings: 6
  },
  {
    name: "Pancakes with Maple Syrup",
    ingredients: "All-purpose flour, Baking powder, Sugar, Salt, Milk, Eggs, Butter, Vanilla extract, Maple syrup, Berries, Whipped cream",
    instructions: "Mix dry ingredients. Whisk together wet ingredients. Combine until just mixed (some lumps okay). Heat griddle to 350°F. Pour 1/4 cup batter per pancake. Cook until bubbles form, flip, cook 1-2 more minutes. Stack high, top with butter, maple syrup, berries, and whipped cream.",
    category: "American",
    tags: "Veg, Breakfast, Sweet, Quick",
    image_url: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600",
    difficulty: "Easy",
    cook_time: 20,
    calories: 480,
    servings: 4
  },
  {
    name: "Falafel Wrap with Tahini",
    ingredients: "Dried chickpeas, Onion, Parsley, Cilantro, Garlic, Cumin, Coriander, Baking powder, Pita bread, Tahini, Lemon, Cucumber, Tomato, Lettuce",
    instructions: "Soak chickpeas overnight. Blend with herbs, garlic, spices until coarse. Form into balls, refrigerate 1 hour. Deep fry at 350°F for 3-4 minutes until golden. Make tahini sauce with tahini, lemon, water. Assemble in pita with falafel, vegetables, and tahini sauce.",
    category: "Middle Eastern",
    tags: "Vegan, Healthy, Lunch",
    image_url: "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?w=600",
    difficulty: "Medium",
    cook_time: 40,
    calories: 420,
    servings: 4
  },
  {
    name: "Sushi Rolls (California Roll)",
    ingredients: "Sushi rice, Nori sheets, Imitation crab, Avocado, Cucumber, Sesame seeds, Rice vinegar, Sugar, Soy sauce, Wasabi, Pickled ginger",
    instructions: "Cook sushi rice, season with rice vinegar and sugar. Lay nori on bamboo mat. Spread rice, flip so rice is down. Add crab, avocado, cucumber. Roll tightly using mat. Slice into 8 pieces. Serve with soy sauce, wasabi, and pickled ginger.",
    category: "Japanese",
    tags: "Non-Veg, Seafood, Healthy, Lunch",
    image_url: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600",
    difficulty: "Medium",
    cook_time: 45,
    calories: 380,
    servings: 4
  }
];

async function seed() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Create sample user
    const password = await bcrypt.hash('demo123', 10);
    const userResult = await db.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) ON CONFLICT (email) DO UPDATE SET username = $1 RETURNING id",
      ['chef_demo', 'demo@tastelog.com', password]
    );
    const userId = userResult.rows[0].id;
    console.log(`✅ Created demo user (ID: ${userId})`);
    console.log('   📧 Email: demo@tastelog.com');
    console.log('   🔑 Password: demo123\n');

    // Insert recipes
    console.log('🍕 Adding sample recipes...\n');
    for (const recipe of sampleRecipes) {
      await db.query(
        `INSERT INTO recipes 
          (user_id, name, ingredients, instructions, category, tags, image_url, difficulty, cook_time, calories, servings)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [userId, recipe.name, recipe.ingredients, recipe.instructions, recipe.category, recipe.tags, recipe.image_url, recipe.difficulty, recipe.cook_time, recipe.calories, recipe.servings]
      );
      console.log(`   ✓ ${recipe.name} (${recipe.category})`);
    }

    console.log(`\n🎉 Successfully seeded ${sampleRecipes.length} recipes!`);
    console.log('\n🚀 Ready to explore TasteLog Premium!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  }
}

seed();
