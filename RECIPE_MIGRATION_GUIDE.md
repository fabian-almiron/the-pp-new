# Recipe Migration Guide

## Step 1: Create Recipe Category Content Type in Strapi

1. Go to http://localhost:1337/admin
2. Navigate to **Content-Type Builder**
3. Click **Create new collection type**
4. Name it `recipeCategory` (Display name: Recipe Category, API ID: `recipe-category`)
5. Add these fields:
   - **name** - Text (Short text) - Required
   - **slug** - Text (Short text) - Required, Unique
6. Click **Save**

## Step 2: Create Recipe Content Type in Strapi

1. In **Content-Type Builder**
2. Click **Create new collection type**
3. Name it `recipe` (API ID: `recipe`)

## Step 3: Add Fields to Recipe Content Type

Add the following fields:

### Text Fields (Short text):
- `title` - Required
- `slug` - Required, Unique
- `headerTitle`
- `methodLabel`
- `time`
- `difficulty`
- `category`
- `servings`
- `videoId`

### Rich Text Fields:
- `content`
- `excerpt`
- `shortDescription`
- `longDescription`
- `notice`

### Boolean:
- `featured` - Default: false

### Media Fields (Single):
- `coverImage` - Single media
- `headerImage` - Single media

### Component Fields (Repeatable):

**Create these components first:**

1. **equipmentItem** component:
   - Text field: `equipmentItem`

2. **ingredientItem** component:
   - Text field: `ingredientsItem`

3. **importantItem** component:
   - Text field: `importantItems`

4. **noteItem** component:
   - Text field: `noteItem`

**Then add these as repeatable components:**
- `equipment` - Repeatable component (equipmentItem)
- `ingredients` - Repeatable component (ingredientItem)
- `important` - Repeatable component (importantItem)
- `notes` - Repeatable component (noteItem)

### Relation Field:
- `recipeCategory` - Relation to Recipe Category (Many-to-One)
  - Recipe has one Recipe Category
  - Recipe Category has many Recipes

### Dates (Automatically included):
- `createdAt`
- `updatedAt`
- `publishedAt`

## Step 4: Enable Public Access

1. Go to **Settings → Users & Permissions → Roles → Public**
2. Find **Recipe** in the list
3. Check these permissions:
   - ✅ find
   - ✅ findOne
4. Find **Recipe Category** in the list
5. Check these permissions:
   - ✅ find
   - ✅ findOne
6. Click **Save**

## Step 5: Run the Migration Script

```bash
node migrate-recipes.js
```

## Step 5: Verify

1. Go to http://localhost:1337/admin/content-manager/collection-types/api::recipe.recipe
2. Check that all recipes are imported
3. Visit http://localhost:3000/recipes to see them on the frontend

## Troubleshooting

If you get errors:
- Make sure Strapi is running on port 1337
- Check that all component fields match exactly
- Verify public permissions are enabled
- Check the console for specific error messages

## Field Mapping Reference

| CSV Field | Strapi Field |
|-----------|--------------|
| Title | title |
| Slug | slug |
| Content | content |
| Excerpt | excerpt |
| header_title | headerTitle |
| method_label | methodLabel |
| short_description | shortDescription |
| long_description | longDescription |
| time | time |
| difficulty | difficulty |
| notice | notice |
| recipe__video_id | videoId |
| Recipe Categories | category |
| equipment_X_equipment_item | equipment[X].equipmentItem |
| ingredients_X_ingredients_item | ingredients[X].ingredientsItem |
| important_X_important_items | important[X].importantItems |
| notes_X_note_item | notes[X].noteItem |

