"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { Book, Eye, Plus, Search, Tag } from "lucide-react";
import Link from "next/link";

function KnowledgePage() {
  const { user, loading } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    loadArticles();
  }, [user, apiBase, selectedCategory, searchQuery]);

  const loadArticles = async () => {
    try {
      const params = new URLSearchParams();
      params.append("isPublished", "true");
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${apiBase}/knowledge/articles?${params}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const articlesData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setArticles(articlesData);
      } else {
        setArticles([]);
      }
    } catch (error) {
      console.error("Failed to load articles:", error);
      setArticles([]);
    }
  };

  const categories = ["all", "AI", "Research", "Education", "Technology", "General"];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover articles, insights, and expert knowledge</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Write Article
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <Button
            key={cat}
            intent={selectedCategory === cat ? "primary" : "secondary"}
            size="sm"
            onClick={() => setSelectedCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/knowledge/${article.id}`}>
            <EnterpriseCard variant="default" hover className="h-full">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle className="text-lg">{article.title}</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                {article.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      <span>{article.viewCount || 0} views</span>
                    </div>
                    {article.category && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{article.category}</span>
                      </div>
                    )}
                  </div>
                  {article.publishedAt && (
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  )}
                </div>
                {article.tags && article.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag: string) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      {articles.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No articles found</p>
        </div>
      )}
    </main>
  );
}

export default function Knowledge() {
  return (
    <ProtectedRoute>
      <KnowledgePage />
    </ProtectedRoute>
  );
}

