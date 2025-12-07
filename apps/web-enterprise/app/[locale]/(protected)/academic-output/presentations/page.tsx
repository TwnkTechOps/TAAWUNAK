"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Presentation, Plus, Search, Filter, Calendar, MapPin, Users, Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "components/Button/Button";

function PresentationsPage() {
  const { user, loading } = useAuth();
  const [presentations, setPresentations] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user) {
      // For now, use events as presentations (conferences, seminars, workshops)
      fetch(`${apiBase}/events`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          // Transform events to presentations format
          const presentationsData = (data || []).map((event: any) => ({
            id: event.id,
            title: event.title,
            description: event.description,
            type: event.type || "CONFERENCE",
            location: event.location,
            startDate: event.startDate,
            endDate: event.endDate,
            organizer: event.organizer,
            institution: event.institution,
            createdAt: event.createdAt
          }));
          setPresentations(presentationsData);
        })
        .catch(err => {
          console.error("Failed to fetch presentations:", err);
          setPresentations([]);
        });
    }
  }, [user, apiBase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const filteredPresentations = presentations.filter(presentation => {
    const matchesSearch = presentation.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (presentation.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === "all" || (presentation.type || "").toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const presentationTypes = {
    CONFERENCE: "Conference",
    SEMINAR: "Seminar",
    WORKSHOP: "Workshop",
    SYMPOSIUM: "Symposium",
    WEBINAR: "Webinar"
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
          <Link href="/academic-output" className="hover:text-brand-600">Academic Output</Link>
          <span>/</span>
          <span>Presentations</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Presentations
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Track conference presentations, seminars, and workshops
            </p>
          </div>
          <Link href="/events">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Add Presentation
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Presentation className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {presentations.length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total Presentations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Calendar className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {presentations.filter(p => {
                const date = new Date(p.startDate);
                const now = new Date();
                return date > now;
              }).length}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Upcoming</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <MapPin className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(presentations.map(p => p.location)).size}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Locations</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <Users className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {new Set(presentations.map(p => p.type)).size}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Types</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 flex-1 min-w-[300px]">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search presentations..."
            className="flex-1 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            className="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="conference">Conference</option>
            <option value="seminar">Seminar</option>
            <option value="workshop">Workshop</option>
            <option value="symposium">Symposium</option>
            <option value="webinar">Webinar</option>
          </select>
        </div>
      </div>

      {/* Presentations List */}
      {filteredPresentations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresentations.map((presentation, index) => {
            const isUpcoming = new Date(presentation.startDate) > new Date();
            return (
              <motion.div
                key={presentation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <EnterpriseCard variant="default" hover glow className="h-full">
                  <EnterpriseCardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-orange-500 to-red-500">
                        <Presentation className="h-6 w-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        isUpcoming 
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                          'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {isUpcoming ? 'Upcoming' : 'Past'}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {presentation.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {presentation.description || "No description available"}
                    </p>
                    <div className="space-y-2 mb-4">
                      {presentation.type && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Presentation className="h-3.5 w-3.5" />
                          <span>{presentationTypes[presentation.type as keyof typeof presentationTypes] || presentation.type}</span>
                        </div>
                      )}
                      {presentation.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="truncate">{presentation.location}</span>
                        </div>
                      )}
                      {presentation.startDate && (
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{new Date(presentation.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {presentation.organizer && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate">{presentation.organizer}</span>
                        </div>
                      </div>
                    )}
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <Presentation className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No presentations found</p>
            <Link href="/events">
              <Button className="mt-4">
                <Plus className="mr-2 h-5 w-5" />
                Add Presentation
              </Button>
            </Link>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </main>
  );
}

export default function Presentations() {
  return (
    <ProtectedRoute>
      <PresentationsPage />
    </ProtectedRoute>
  );
}

