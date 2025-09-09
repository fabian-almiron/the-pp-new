"use client"

import { useUser } from "@/contexts/user-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PageTemplateProps {
  title: string;
  children?: React.ReactNode;
}

export function PageTemplate({ title, children }: PageTemplateProps) {
  const { isLoggedIn, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoggedIn, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="video-library-hero">
        <div className="video-library-hero-content">
          <h1 style={{ 
            fontFamily: 'Playfair Display, serif', 
            fontSize: '104px', 
            color: '#000000',
            lineHeight: '1.1',
            marginBottom: '2rem',
            fontWeight: 'normal'
          }}>
            {title}
          </h1>
        </div>
      </section>

      {/* Video Catalog Section */}
      <section className="newest-videos-section">
        <div className="newest-videos-content">
          <h2 className="newest-videos-title">Video Catalog</h2>
          <div className="text-center text-gray-600">
            <p className="text-lg">Coming soon - Video content for this section will be added here.</p>
          </div>
        </div>
      </section>

      {/* Additional Content */}
      {children}
    </div>
  );
}
