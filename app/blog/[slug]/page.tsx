import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogBySlug } from "@/lib/strapi-api";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArticleSchema } from "@/components/structured-data";
import { sanitizeHTML } from "@/lib/sanitize";

// Mark as dynamic
export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await fetchBlogBySlug(slug);
    
    if (!post) {
      return {
        title: 'Blog Post Not Found | The Piped Peony',
      };
    }

    const description = post.excerpt || post.content?.replace(/<[^>]*>/g, '').substring(0, 160) || `Read ${post.title} on The Piped Peony blog`;

  return {
    title: `${post.title} | The Piped Peony Blog`,
    description,
    keywords: post.tags || [],
    authors: [{ name: post.author || 'Dara' }],
    openGraph: {
      title: post.title,
      description,
      url: `https://thepipedpeony.com/blog/${slug}`,
      siteName: "The Piped Peony",
      images: post.coverImage ? [
        {
          url: post.coverImage.url,
          width: 1200,
          height: 630,
          alt: post.coverImage.alternativeText || post.title,
        },
      ] : [],
      locale: "en_US",
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author || 'Dara'],
      tags: post.tags || [],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.coverImage ? [post.coverImage.url] : [],
    },
    alternates: {
      canonical: `https://thepipedpeony.com/blog/${slug}`,
    },
  };
  } catch (error) {
    console.error('Error generating blog metadata:', error);
    return {
      title: 'Blog Post | The Piped Peony',
      description: 'Read our latest blog post on The Piped Peony',
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  
  try {
    const post = await fetchBlogBySlug(slug);

    if (!post) {
      notFound();
    }

  return (
    <div className="bg-white min-h-screen">
      <ArticleSchema
        headline={post.title}
        description={post.excerpt}
        image={post.coverImage?.url}
        datePublished={post.publishedAt}
        dateModified={post.updatedAt || post.publishedAt}
        author={post.author || "Dara"}
        url={`https://thepipedpeony.com/blog/${slug}`}
      />
      {/* Header */}
      <div className="bg-gradient-to-b from-[#FBF9F6] to-white py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24">
          <div className="max-w-4xl mx-auto">
            {/* Back Link */}
            <Link 
              href="/blog" 
              className="inline-flex items-center text-[#D4A771] hover:underline mb-8"
            >
              ← Back to Blog
            </Link>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-8">
              <span>By {post.author}</span>
              <span>•</span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span>•</span>
              <span>{post.readTime} min read</span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span 
                    key={index}
                    className="text-sm px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {post.coverImage && (
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 mb-12">
          <div className="max-w-4xl mx-auto">
            <div className="relative h-64 md:h-96 lg:h-[500px] rounded-lg overflow-hidden">
              <Image
                src={post.coverImage.url}
                alt={post.coverImage.alternativeText || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium italic border-l-4 border-[#D4A771] pl-6">
              {post.excerpt}
            </p>
          )}

          {/* Rich Text Content */}
          <div 
            className="prose prose-lg max-w-none
              prose-headings:font-serif prose-headings:text-gray-900
              prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
              prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
              prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-[#D4A771] prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-ul:my-6 prose-li:text-gray-700
              prose-img:rounded-lg prose-img:shadow-md
            "
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(post.content) }}
          />

          {/* Author & Date Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Written by</p>
                <p className="text-lg font-medium text-gray-900">{post.author}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Published</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>

          {/* Back to Blog */}
          <div className="mt-12 text-center">
            <Link 
              href="/blog"
              className="inline-block px-8 py-3 bg-[#D4A771] text-white font-medium rounded-md hover:bg-[#C19660] transition-colors"
            >
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}
