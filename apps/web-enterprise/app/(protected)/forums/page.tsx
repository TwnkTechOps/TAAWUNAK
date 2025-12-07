"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { MessageSquare, TrendingUp, Clock, ThumbsUp, Plus, Search } from "lucide-react";
import Link from "next/link";

function ForumsPage() {
  const { user, loading } = useAuth();
  const [forums, setForums] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    loadForums();
  }, [user, apiBase, selectedCategory, searchQuery]);

  const loadForums = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "all") params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`${apiBase}/forums?${params}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const forumsData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setForums(forumsData);
      } else {
        setForums([]);
      }
    } catch (error) {
      console.error("Failed to load forums:", error);
      setForums([]);
    }
  };

  const categories = ["all", "AI", "Renewable Energy", "EdTech", "Research", "General"];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Discussion Forums</h1>
          <p className="text-gray-600 dark:text-gray-400">Join discussions and share knowledge</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Forum
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search forums..."
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

      {/* Forums Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {forums.map((forum) => (
          <Link key={forum.id} href={`/forums/${forum.id}`}>
            <EnterpriseCard variant="default" hover className="h-full">
              <EnterpriseCardHeader>
                <div className="flex items-start justify-between">
                  <EnterpriseCardTitle className="text-lg">{forum.title}</EnterpriseCardTitle>
                  {forum.category && (
                    <span className="px-2 py-1 text-xs bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded">
                      {forum.category}
                    </span>
                  )}
                </div>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {forum.description || "No description"}
                </p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{forum._count?.posts || 0} posts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(forum.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      {forums.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No forums found</p>
        </div>
      )}
    </main>
  );
}

export default function Forums() {
  return (
    <ProtectedRoute>
      <ForumsPage />
    </ProtectedRoute>
  );
}

