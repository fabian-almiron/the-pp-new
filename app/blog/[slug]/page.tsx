"use client"

import React, { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchBlogBySlug, BlogPost } from "@/lib/strapi-api";
import { PeonyLoader } from "@/components/ui/peony-loader";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  // Unwrap the params promise for Next.js 15
  const { slug } = use(params);
  
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBlog = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const blogPost = await fetchBlogBySlug(slug);
        
        if (!blogPost) {
          setError('Blog post not found');
        } else {
          setPost(blogPost);
        }
      } catch (err) {
        setError('Failed to load blog post. Please make sure Strapi is running.');
      }
      
      setLoading(false);
    };

    loadBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <div className="flex justify-center items-center py-16">
            <PeonyLoader />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="bg-white min-h-screen">
        <div className="container mx-auto px-4 md:px-8 lg:px-16 xl:px-24 py-12 md:py-24">
          <div className="max-w-3xl mx-auto">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded mb-8">
              <p className="font-bold">Notice</p>
              <p>{error || 'Blog post not found'}</p>
            </div>
            <Link href="/blog" className="text-[#D4A771] hover:underline">
              ← Back to Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
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
            dangerouslySetInnerHTML={{ __html: post.content }}
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
}
