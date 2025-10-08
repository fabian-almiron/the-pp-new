/**
 * Migration Script: Convert JSON categories to Relations
 * 
 * This script migrates category data from the JSON field to the new relation field
 * Run this with: node migrate-categories.js
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN environment variable is not set');
  console.error('Please set it in your .env.local file or export it in your terminal');
  process.exit(1);
}

async function migrateCategoryRelations() {
  console.log('🚀 Starting category migration...\n');

  try {
    // Step 1: Fetch all categories to build a name-to-id map
    console.log('📋 Fetching all categories...');
    const categoriesResponse = await fetch(`${STRAPI_URL}/api/categories?pagination[limit]=100`, {
      headers: {
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
      },
    });

    if (!categoriesResponse.ok) {
      throw new Error(`Failed to fetch categories: ${categoriesResponse.statusText}`);
    }

    const categoriesData = await categoriesResponse.json();
    const categories = categoriesData.data;

    if (!categories || categories.length === 0) {
      throw new Error('No categories found in Strapi');
    }

    // Build a map of category name -> category id
    const categoryMap = {};
    categories.forEach(cat => {
      const name = cat.attributes?.name || cat.name;
      if (name) {
        categoryMap[name] = cat.id;
      }
    });

    console.log(`✅ Found ${categories.length} categories:`);
    Object.entries(categoryMap).forEach(([name, id]) => {
      console.log(`   - ${name} (ID: ${id})`);
    });
    console.log('');

    // Step 2: Fetch all courses
    console.log('📚 Fetching all courses...');
    let allCourses = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const coursesResponse = await fetch(
        `${STRAPI_URL}/api/courses?pagination[page]=${page}&pagination[pageSize]=100`,
        {
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
          },
        }
      );

      if (!coursesResponse.ok) {
        throw new Error(`Failed to fetch courses: ${coursesResponse.statusText}`);
      }

      const coursesData = await coursesResponse.json();
      allCourses = allCourses.concat(coursesData.data);

      hasMore = coursesData.meta.pagination.page < coursesData.meta.pagination.pageCount;
      page++;
    }

    console.log(`✅ Found ${allCourses.length} courses to migrate\n`);

    // Step 3: Migrate each course
    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    for (const course of allCourses) {
      const courseId = course.documentId || course.id;
      const courseName = course.name || course.title || `Course ${courseId}`;
      const jsonCategories = course.categories;

      // Skip if no JSON categories
      if (!jsonCategories || jsonCategories.length === 0) {
        console.log(`⏭️  Skipping "${courseName}" - no categories in JSON field`);
        skipCount++;
        continue;
      }

      // Convert category names to IDs
      const categoryIds = [];
      const notFound = [];

      jsonCategories.forEach(categoryName => {
        const categoryId = categoryMap[categoryName];
        if (categoryId) {
          categoryIds.push(categoryId);
        } else {
          notFound.push(categoryName);
        }
      });

      if (notFound.length > 0) {
        console.log(`⚠️  Warning: "${courseName}" has unknown categories: ${notFound.join(', ')}`);
      }

      if (categoryIds.length === 0) {
        console.log(`⏭️  Skipping "${courseName}" - no matching categories found`);
        skipCount++;
        continue;
      }

      // Update the course with the new relation
      try {
        const updateResponse = await fetch(`${STRAPI_URL}/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              category_relations: categoryIds,
            },
          }),
        });

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.json();
          console.error(`❌ Error migrating "${courseName}":`, JSON.stringify(errorBody, null, 2));
          errorCount++;
          continue;
        }

        console.log(`✅ Migrated "${courseName}" - ${categoryIds.length} categories`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error migrating "${courseName}": ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} courses`);
    console.log(`   ⏭️  Skipped: ${skipCount} courses`);
    console.log(`   ❌ Errors: ${errorCount} courses`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Verify the data in Strapi Content Manager');
      console.log('   2. Check a few courses to ensure category_relation is populated');
      console.log('   3. Once verified, you can delete the old JSON "categories" field');
      console.log('   4. Rename "category_relation" to "categories" in Content-Type Builder');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
migrateCategoryRelations();
