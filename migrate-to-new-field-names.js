/**
 * Migration Script: Migrate from old field names to new field names
 * 
 * Old: course_relations <-> category_relations
 * New: course <-> category
 * 
 * Run this with: node migrate-to-new-field-names.js
 */

const STRAPI_URL = 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN || '8fdf2d01943c57f7661eddae075f053483d806a3ac41a637e10d84359af0a8a54ded5167abdf0e68f26d77571698c84d4f14d5c7097eeab0afed86b796c74e1ae0d0b0064dc0a3ac69393fc2107598b5ffd05056b39ca6d3b8b439a62c8d76bba50ba634b8d44655d295de7e8e683f7be9c2d1b484bcac5396d2f098572aa972';

if (!STRAPI_API_TOKEN) {
  console.error('❌ Error: STRAPI_API_TOKEN environment variable is not set');
  process.exit(1);
}

async function migrateFieldNames() {
  console.log('🚀 Starting migration to new field names...\n');

  try {
    // Step 1: Fetch all courses with the OLD populate field name
    console.log('📚 Fetching all courses with old field data...');
    let allCourses = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      // Try to populate using the old field name from the database
      const coursesResponse = await fetch(
        `${STRAPI_URL}/api/courses?pagination[page]=${page}&pagination[pageSize]=100&populate=category_relations`,
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

    console.log(`✅ Found ${allCourses.length} courses\n`);

    // Step 2: Fetch all categories
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

    console.log(`✅ Found ${categories.length} categories\n`);

    // Step 3: Build category name to ID map
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name] = cat.documentId || cat.id;
    });

    // Step 4: Build mapping of category -> courses from old data
    console.log('🔄 Extracting old relationship data...\n');
    const categoryToCourses = {};

    categories.forEach(cat => {
      const name = cat.name;
      categoryToCourses[name] = {
        categoryId: cat.documentId || cat.id,
        categoryName: name,
        courseIds: []
      };
    });

    // Check each course for old category_relations data
    let coursesWithData = 0;
    allCourses.forEach(course => {
      const courseId = course.documentId || course.id;
      const oldCategories = course.category_relations;

      if (oldCategories && oldCategories.length > 0) {
        coursesWithData++;
        oldCategories.forEach(cat => {
          const categoryName = cat.name;
          if (categoryToCourses[categoryName]) {
            categoryToCourses[categoryName].courseIds.push(courseId);
          }
        });
      }
    });

    console.log(`📊 Found ${coursesWithData} courses with old relationship data\n`);

    // Step 5: Update each category with NEW field name
    let successCount = 0;
    let errorCount = 0;

    for (const [categoryName, data] of Object.entries(categoryToCourses)) {
      if (data.courseIds.length === 0) {
        continue;
      }

      try {
        const updateResponse = await fetch(`${STRAPI_URL}/api/categories/${data.categoryId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${STRAPI_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: {
              course: data.courseIds,  // NEW field name
            },
          }),
        });

        if (!updateResponse.ok) {
          const errorBody = await updateResponse.json();
          console.error(`❌ Error updating "${categoryName}":`, JSON.stringify(errorBody, null, 2));
          errorCount++;
          continue;
        }

        console.log(`✅ Migrated "${categoryName}" - ${data.courseIds.length} courses`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error updating "${categoryName}": ${error.message}`);
        errorCount++;
      }
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Migration Summary:');
    console.log(`   ✅ Successfully migrated: ${successCount} categories`);
    console.log(`   ❌ Errors: ${errorCount} categories`);
    console.log('='.repeat(50));

    if (successCount > 0) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('   1. Rebuild Strapi: npm run build');
      console.log('   2. Restart your Strapi server');
      console.log('   3. Refresh admin - relationships should now appear under "category" field');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
migrateFieldNames();
