import Navigation from '@/components/navigation';
import { fetchAllMenus } from '@/lib/strapi-api';

export default async function TestMenuPage() {
  const { data: menus, error } = await fetchAllMenus();

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-serif font-bold mb-8">Menu System Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8">
          <p className="font-bold">Error loading menus:</p>
          <p>{error}</p>
        </div>
      )}

      {menus && menus.length > 0 ? (
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold mb-4">Available Menus:</h2>
          
          {menus.map((menu) => (
            <div key={menu.id} className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-2">{menu.title}</h3>
              <p className="text-gray-600 mb-4">Slug: {menu.slug}</p>
              {menu.description && (
                <p className="text-gray-700 mb-4">{menu.description}</p>
              )}
              
              <div className="mb-4">
                <h4 className="font-medium mb-2">Navigation Component:</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <Navigation menuSlug={menu.slug} />
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Menu Items ({menu.menuItems.length}):</h4>
                <ul className="space-y-2">
                  {menu.menuItems.map((item) => (
                    <li key={item.id} className="bg-gray-50 p-3 rounded">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-sm text-gray-500">
                          {item.url} ({item.target})
                        </span>
                      </div>
                      {item.children && item.children.length > 0 && (
                        <ul className="mt-2 ml-4 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.id} className="text-sm text-gray-600">
                              → {child.title} ({child.url})
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">No menus found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Make sure you've created menus in Strapi and they are published.
          </p>
        </div>
      )}

      <div className="mt-12 bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">How to Use:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>1. In your layout or header component:</strong></p>
          <code className="block bg-white p-2 rounded text-xs">
            {`<Navigation menuSlug="menu" className="your-nav-classes" />`}
          </code>
          
          <p><strong>2. The slug "menu" matches your menu in Strapi</strong></p>
          <p><strong>3. Customize the styling by modifying the Navigation component</strong></p>
        </div>
      </div>
    </div>
  );
}
