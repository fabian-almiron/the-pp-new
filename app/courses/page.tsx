"use client"

import { fetchCourses } from "@/lib/strapi-api";
import Link from "next/link";
import Image from "next/image";
import { SubscriberGate } from "@/components/subscriber-gate";
import { useEffect, useState, useMemo } from "react";
import { Video, Star, Search, X, Filter, Sparkles, Clock, TrendingUp, Award, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Function to get Vimeo thumbnail URL
function getVimeoThumbnail(videoId: string, size: 'small' | 'medium' | 'large' = 'large'): string {
  if (!videoId) return '';
  
  // Vimeo thumbnail URL format
  const sizeMap = {
    small: '200x150',
    medium: '640x480', 
    large: '1280x720'
  };
  
  return `https://vumbnail.com/${videoId}_${sizeMap[size]}.jpg`;
}

export default function AllCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCourses() {
      const { data, error } = await fetchCourses({ 
        pageSize: 100,
        sort: 'title:asc' 
      });
      
      if (error) {
        setError(error);
      } else {
        setCourses(data || []);
      }
      setLoading(false);
    }
    
    loadCourses();
  }, []);

  return (
    <SubscriberGate>
      <CoursesContent courses={courses} error={error} loading={loading} />
    </SubscriberGate>
  );
}

function CoursesContent({ courses, error, loading }: { courses: any[], error: string | null, loading: boolean }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedSeries, setSelectedSeries] = useState<string>('all');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);

  // Get unique series and levels - use empty arrays if courses is null
  const allSeries = useMemo(() => 
    courses ? Array.from(new Set(courses.map(c => c.series || 'Other Courses'))).sort() : []
  , [courses]);
  
  const allLevels = useMemo(() => 
    courses ? Array.from(new Set(courses.map(c => c.courseLevel).filter(Boolean))).sort() : []
  , [courses]);

  // Filter courses based on filters
  const filteredCourses = useMemo(() => {
    if (!courses) return [];
    
    return courses.filter(course => {
      // Search filter
      if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !course.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'all' && course.courseLevel !== selectedLevel) {
        return false;
      }

      // Series filter
      const courseSeries = course.series || 'Other Courses';
      if (selectedSeries !== 'all' && courseSeries !== selectedSeries) {
        return false;
      }

      // Featured filter
      if (showFeaturedOnly && !course.featured) {
        return false;
      }

      return true;
    });
  }, [courses, searchQuery, selectedLevel, selectedSeries, showFeaturedOnly]);

  // Group filtered courses by series
  const coursesBySeries = useMemo(() => {
    return filteredCourses.reduce((acc, course) => {
      const series = course.series || 'Other Courses';
      if (!acc[series]) {
        acc[series] = [];
      }
      acc[series].push(course);
      return acc;
    }, {} as Record<string, typeof courses>);
  }, [filteredCourses]);

  // Check if any filters are active
  const hasActiveFilters = searchQuery || selectedLevel !== 'all' || selectedSeries !== 'all' || showFeaturedOnly;

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedLevel('all');
    setSelectedSeries('all');
    setShowFeaturedOnly(false);
  };

  // Get featured courses
  const featuredCourses = useMemo(() => courses ? courses.filter(c => c.featured) : [], [courses]);

  // NOW handle loading and error states AFTER all hooks
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error || !courses) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-serif font-bold mb-8">All Courses</h1>
        <p className="text-red-600">Error loading courses: {error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6]">
      {/* Hero Section */}
      <div 
        className="relative py-16 px-4 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/archive-header-bg.svg)' }}
      >
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <Badge className="mb-4 bg-black/70 text-white border-black/50 hover:bg-black/80 backdrop-blur-sm">
            <Award className="w-3 h-3 mr-1" />
            Premium Course Library
          </Badge>
          <h1 className="text-4xl md:text-6xl font-serif mb-4 text-black">
            Master the Art of Cake Decorating
          </h1>
          <p className="text-lg md:text-xl text-gray-800 mb-8 max-w-3xl mx-auto">
            Learn from expert instructor Dara with our comprehensive video courses. 
            From beginner techniques to advanced piping artistry.
          </p>
          
          {/* Trust Indicators */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-12">
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-md">
              <div className="text-3xl font-bold mb-1 text-black">{courses.length}+</div>
              <div className="text-sm text-gray-600">Video Courses</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-md">
              <div className="text-3xl font-bold mb-1 text-black">
                {courses.reduce((acc, c) => acc + (c.videoChapters?.length || 0), 0)}+
              </div>
              <div className="text-sm text-gray-600">Video Lessons</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-md">
              <Clock className="w-6 h-6 mx-auto mb-2 text-[#D4A771]" />
              <div className="text-sm text-gray-600">Learn at Your Pace</div>
            </div>
            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 shadow-md">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-[#D4A771]" />
              <div className="text-sm text-gray-600">Lifetime Access</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Featured Courses Section */}
          {featuredCourses.length > 0 && (
            <div className="mb-16">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-serif font-bold text-black mb-2 flex items-center gap-2">
                    <Star className="w-8 h-8 text-[#D4A771] fill-[#D4A771]" />
                    Featured Courses
                  </h2>
                  <p className="text-gray-700">Start with our most popular courses</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {featuredCourses.slice(0, 3).map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group relative"
                  >
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-[#D4A771]">
                      {/* Featured Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-[#D4A771] text-white border-0 hover:bg-[#C99860]">
                          <Star className="w-3 h-3 mr-1 fill-white" />
                          Featured
                        </Badge>
                      </div>

                      {/* Course Image */}
                      <div className="relative h-56 bg-[#FBF9F6]">
                        {course.featuredImage ? (
                          <Image
                            src={course.featuredImage.url}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : course.videoId ? (
                          <Image
                            src={getVimeoThumbnail(course.videoId)}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-6xl">🌸</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Course Info */}
                      <div className="p-6">
                        {/* Level Badge */}
                        {course.courseLevel && (
                          <Badge 
                            className={`mb-3 ${
                              course.courseLevel === 'beginner' ? 'bg-green-100 text-green-700 border-green-300' :
                              course.courseLevel === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-300' :
                              'bg-red-100 text-red-700 border-red-300'
                            }`}
                          >
                            {course.courseLevel}
                          </Badge>
                        )}

                        <h3 className="text-xl font-bold mb-3 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2">
                          {course.title}
                        </h3>
                        
                        {course.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                            {course.excerpt}
                          </p>
                        )}

                        {/* Course Meta */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          {course.videoChapters && course.videoChapters.length > 0 && (
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <Video className="w-4 h-4 text-[#D4A771]" />
                              <span className="font-medium">{course.videoChapters.length} chapters</span>
                            </div>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#D4A771] hover:text-[#C99860] hover:bg-[#FBF9F6] ml-auto"
                          >
                            View Course →
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

        {/* Filters Section */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-800">Filter Courses</h2>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="ml-auto text-xs"
              >
                <X className="w-3 h-3 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search courses by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Pills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLevel('all')}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                    selectedLevel === 'all'
                      ? 'bg-[#D4A771] text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Levels
                </button>
                {allLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => setSelectedLevel(level)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all capitalize ${
                      selectedLevel === level
                        ? level === 'beginner' ? 'bg-green-500 text-white shadow-md' :
                          level === 'intermediate' ? 'bg-yellow-500 text-white shadow-md' :
                          'bg-red-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Series Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Series</label>
              <select
                value={selectedSeries}
                onChange={(e) => setSelectedSeries(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#D4A771] text-sm"
              >
                <option value="all">All Series</option>
                {allSeries.map(series => (
                  <option key={series} value={series}>{series}</option>
                ))}
              </select>
            </div>

            {/* Featured Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special</label>
              <button
                onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                className={`w-full px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                  showFeaturedOnly
                    ? 'bg-[#D4A771] text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                Featured Only
              </button>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold text-black">{filteredCourses.length}</span> of {courses.length} courses
              {hasActiveFilters && <span className="text-black"> (filtered)</span>}
            </p>
          </div>
        </div>

        {/* All Courses Section */}
        <div className="mb-12">
          <div className="mb-8">
            <h2 className="text-3xl font-serif font-bold text-black mb-2">
              Browse All Courses
            </h2>
            <p className="text-gray-600">
              Explore our complete collection organized by series
            </p>
          </div>

          {/* Course Series Sections */}
          {Object.entries(coursesBySeries).map(([series, seriesCourses]) => (
            <div key={series} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-1 w-12 bg-[#D4A771] rounded-full"></div>
                <h3 className="text-2xl font-serif font-bold text-black">
                  {series}
                </h3>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {seriesCourses.map((course) => (
                  <Link
                    key={course.id}
                    href={`/courses/${course.slug}`}
                    className="group relative"
                  >
                    <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 h-full flex flex-col">
                      {/* Course Image */}
                      <div className="relative h-44 bg-[#FBF9F6]">
                        {course.featuredImage ? (
                          <Image
                            src={course.featuredImage.url}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : course.videoId ? (
                          <Image
                            src={getVimeoThumbnail(course.videoId)}
                            alt={course.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-5xl">🌸</span>
                          </div>
                        )}
                        
                        {/* Overlay on hover */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#D4A771]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        {/* Level Badge */}
                        {course.courseLevel && (
                          <div className="absolute top-3 right-3">
                            <Badge className={`${
                              course.courseLevel === 'beginner' ? 'bg-green-500 hover:bg-green-600' :
                              course.courseLevel === 'intermediate' ? 'bg-yellow-500 hover:bg-yellow-600' :
                              'bg-red-500 hover:bg-red-600'
                            } text-white border-0 shadow-lg`}>
                              {course.courseLevel}
                            </Badge>
                          </div>
                        )}

                        {/* Featured Badge */}
                        {course.featured && (
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-[#D4A771] text-white border-0 shadow-lg hover:bg-[#C99860]">
                              <Star className="w-3 h-3 mr-1 fill-white" />
                              Featured
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div className="p-5 flex-1 flex flex-col">
                        <h3 className="text-base font-bold mb-2 text-black group-hover:text-[#D4A771] transition-colors line-clamp-2 min-h-[3rem]">
                          {course.title}
                        </h3>
                        
                        {course.excerpt && (
                          <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                            {course.excerpt}
                          </p>
                        )}

                        {/* Course Meta */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                          {course.videoChapters && course.videoChapters.length > 0 && (
                            <div className="flex items-center gap-1.5 text-sm text-gray-500">
                              <Video className="w-4 h-4 text-[#D4A771]" />
                              <span className="font-medium">{course.videoChapters.length} chapters</span>
                            </div>
                          )}
                          <span className="text-sm font-medium text-[#D4A771] group-hover:translate-x-1 transition-transform">
                            View →
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

          {/* If no courses match filters */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Filter className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-xl text-gray-600 mb-2">No courses match your filters</p>
              <p className="text-sm text-gray-500 mb-4">Try adjusting your search criteria</p>
              {hasActiveFilters && (
                <Button
                  onClick={resetFilters}
                  variant="outline"
                  className="mx-auto"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
