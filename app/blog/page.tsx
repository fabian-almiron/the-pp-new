import Image from "next/image";
import Link from "next/link";
import { fetchBlogs } from "@/lib/strapi-api";
import type { Metadata } from "next";

// Mark this page as dynamic (always server-rendered)
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "The Piped Peony Blog | Cake Decorating Tips & Tutorials",
  description: "Tips, tutorials, and inspiration for buttercream artists and bakers. Learn from expert instructor Dara and discover the latest cake decorating techniques.",
  keywords: ["cake decorating blog", "buttercream tips", "piping tutorials", "baking blog", "cake decorating inspiration"],
  openGraph: {
    title: "The Piped Peony Blog | Cake Decorating Tips & Tutorials",
    description: "Tips, tutorials, and inspiration for buttercream artists and bakers.",
    url: "https://thepipedpeony.com/blog",
    siteName: "The Piped Peony",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Piped Peony Blog",
    description: "Cake decorating tips, tutorials, and inspiration",
  },
  alternates: {
    canonical: "https://thepipedpeony.com/blog",
  },
};

export default async function BlogPage() {
  let posts;
  let error = null;

  try {
    posts = await fetchBlogs();
    if (!posts || posts.length === 0) {
      console.log('No blog posts found or API returned empty array');
    }
  } catch (err) {
    console.error('Blog fetch error:', err);
    error = 'Failed to load blog posts. Please make sure Strapi is running and the Blog API is accessible.';
    posts = [];
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">The Piped Peony Blog</h1>
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-8">
            <p className="font-bold">Notice</p>
            <p>{error}</p>
            <p className="mt-2 text-sm">
              To add blog posts: Visit <a href="http://localhost:1337/admin" className="underline">http://localhost:1337/admin</a>, 
              create blog posts, and make them public in Settings → Users & Permissions → Public → Blog (find & findOne).
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div 
        className="bg-gradient-to-b from-[#FBF9F6] to-white py-16 md:py-24"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-4">
            The Piped Peony Blog
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tips, tutorials, and inspiration for buttercream artists and bakers
          </p>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No blog posts yet.</p>
            <p className="text-gray-500 mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link 
                key={post.documentId} 
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
              >
                {/* Cover Image */}
                <div className="relative h-48 bg-gray-200 overflow-hidden">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage.url}
                      alt={post.coverImage.alternativeText || post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-[#D4A771] to-[#C19660]">
                      <span className="text-white text-4xl">✿</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Meta Info */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                    <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{post.readTime} min read</span>
                  </div>

                  {/* Title */}
                  <h2 className="text-xl font-serif font-bold text-gray-900 mb-2 group-hover:text-[#D4A771] transition-colors">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  {post.excerpt && (
                    <p className="text-gray-600 line-clamp-3 mb-4">
                      {post.excerpt}
                    </p>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">By {post.author}</span>
                    <span className="text-[#D4A771] group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

