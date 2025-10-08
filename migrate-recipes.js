const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const STRAPI_URL = 'http://localhost:1337';

// Function to parse CSV and convert to recipe objects
async function parseRecipesCSV() {
  const recipes = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(path.join(__dirname, 'recipes-Export-2025-October-07-2204.csv'))
      .pipe(csv())
      .on('data', (row) => {
        // Skip empty rows
        if (!row.Title) return;

        const recipe = {
          title: row.Title,
          slug: row.Slug,
          content: row.Content || '',
          excerpt: row.Excerpt || '',
          headerTitle: row.header_title || row.Title,
          methodLabel: row.method_label || '',
          shortDescription: row.short_description || '',
          longDescription: row.long_description || '',
          time: row.time || '',
          difficulty: row.difficulty || '',
          notice: row.notice || '',
          videoId: row.recipe__video_id || '',
          featured: row.Featured === 'https://thepipedpeony.com/wp-content/uploads/2023/05/blooming-buttercream-recipe.png',
          category: row['Recipe Categories'] || '',
          
          // Parse equipment items
          equipment: [],
          // Parse ingredients items
          ingredients: [],
          // Parse important items
          important: [],
          // Parse notes items
          notes: [],
        };

        // Collect equipment items
        for (let i = 0; i < 20; i++) {
          const equipmentKey = `equipment_${i}_equipment_item`;
          if (row[equipmentKey] && row[equipmentKey].trim()) {
            recipe.equipment.push({ equipmentItem: row[equipmentKey].trim() });
          }
        }

        // Collect ingredients items
        for (let i = 0; i < 20; i++) {
          const ingredientKey = `ingredients_${i}_ingredients_item`;
          if (row[ingredientKey] && row[ingredientKey].trim()) {
            recipe.ingredients.push({ ingredientsItem: row[ingredientKey].trim() });
          }
        }

        // Collect important items
        for (let i = 0; i < 20; i++) {
          const importantKey = `important_${i}_important_items`;
          if (row[importantKey] && row[importantKey].trim()) {
            recipe.important.push({ importantItems: row[importantKey].trim() });
          }
        }

        // Collect notes items
        for (let i = 0; i < 15; i++) {
          const noteKey = `notes_${i}_note_item`;
          if (row[noteKey] && row[noteKey].trim()) {
            recipe.notes.push({ noteItem: row[noteKey].trim() });
          }
        }

        // Add servings from notes if it contains "Makes"
        const makesNote = recipe.notes.find(n => n.noteItem && n.noteItem.includes('Makes'));
        if (makesNote) {
          recipe.servings = makesNote.noteItem;
        }

        recipes.push(recipe);
      })
      .on('end', () => {
        console.log(`✅ Parsed ${recipes.length} recipes from CSV`);
        resolve(recipes);
      })
      .on('error', reject);
  });
}

// Function to find or create a category
async function findOrCreateCategory(categoryName) {
  if (!categoryName) return null;
  
  try {
    // First, try to find existing category
    const searchResponse = await fetch(`${STRAPI_URL}/api/recipe-categories?filters[name][$eq]=${encodeURIComponent(categoryName)}`);
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.data && searchData.data.length > 0) {
        console.log(`  ✓ Found existing category: ${categoryName}`);
        return searchData.data[0].id;
      }
    }
    
    // If not found, create new category
    console.log(`  → Creating new category: ${categoryName}`);
    const createResponse = await fetch(`${STRAPI_URL}/api/recipe-categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          name: categoryName,
          slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }
      })
    });
    
    if (createResponse.ok) {
      const createData = await createResponse.json();
      console.log(`  ✓ Created category: ${categoryName}`);
      return createData.data.id;
    }
  } catch (error) {
    console.warn(`  ⚠️  Could not create category ${categoryName}:`, error.message);
  }
  
  return null;
}

// Function to create a recipe in Strapi
async function createRecipe(recipe) {
  try {
    console.log(`\n📝 Creating recipe: ${recipe.title}`);
    
    // Try to find or create category
    let categoryId = null;
    if (recipe.category) {
      categoryId = await findOrCreateCategory(recipe.category);
    }
    
    // Build the data object
    const recipeData = {
      title: recipe.title,
      slug: recipe.slug,
      content: recipe.content,
      excerpt: recipe.excerpt,
      headerTitle: recipe.headerTitle,
      methodLabel: recipe.methodLabel,
      shortDescription: recipe.shortDescription,
      longDescription: recipe.longDescription,
      time: recipe.time,
      difficulty: recipe.difficulty,
      notice: recipe.notice,
      videoId: recipe.videoId,
      featured: recipe.featured,
      servings: recipe.servings,
      equipment: recipe.equipment,
      ingredients: recipe.ingredients,
      important: recipe.important,
      notes: recipe.notes,
      publishedAt: new Date().toISOString(),
    };

    // Only add category if we have a relation ID
    if (categoryId) {
      recipeData.recipeCategory = categoryId;
    }
    
    const response = await fetch(`${STRAPI_URL}/api/recipes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: recipeData })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Failed to create ${recipe.title}:`, response.status, errorText);
      return { success: false, title: recipe.title, error: errorText };
    }

    const result = await response.json();
    console.log(`✅ Created: ${recipe.title}`);
    return { success: true, title: recipe.title, data: result };
  } catch (error) {
    console.error(`❌ Error creating ${recipe.title}:`, error.message);
    return { success: false, title: recipe.title, error: error.message };
  }
}

// Main migration function
async function migrateRecipes() {
  console.log('🚀 Starting recipe migration...\n');
  
  try {
    // Parse CSV
    const recipes = await parseRecipesCSV();
    
    console.log(`\n📊 Found ${recipes.length} recipes to import\n`);
    
    // Create recipes in Strapi
    const results = [];
    for (const recipe of recipes) {
      const result = await createRecipe(recipe);
      results.push(result);
      
      // Add a small delay to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📝 Total: ${results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed recipes:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`  - ${r.title}: ${r.error}`);
      });
    }
    
    console.log('\n✨ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateRecipes();

