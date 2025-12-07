"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { EnterpriseKpiCard } from "components/Card";
import { Button } from "components/Button/Button";
import { Calendar, Clock, Users, MapPin, Plus, Video } from "lucide-react";
import Link from "next/link";

function EventsPage() {
  const { user, loading } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    loadEvents();
  }, [user, apiBase, upcomingOnly]);

  const loadEvents = async () => {
    try {
      const params = new URLSearchParams();
      if (upcomingOnly) params.append("upcoming", "true");

      const res = await fetch(`${apiBase}/events?${params}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        // Ensure data is an array
        const eventsData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setEvents(eventsData);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const upcomingCount = events.filter(e => new Date(e.startTime) > new Date()).length;
  const registeredCount = events.reduce((sum, e) => sum + (e._count?.registrations || 0), 0);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Events & Webinars</h1>
          <p className="text-gray-600 dark:text-gray-400">Discover and join workshops, conferences, and webinars</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <EnterpriseKpiCard
          label="Upcoming Events"
          value={upcomingCount}
          icon={Calendar}
          trend="up"
          variant="gradient"
        />
        <EnterpriseKpiCard
          label="Total Registrations"
          value={registeredCount}
          icon={Users}
          trend="up"
          variant="default"
        />
      </div>

      {/* Filter */}
      <div className="mb-6">
        <Button
          intent={upcomingOnly ? "primary" : "secondary"}
          size="sm"
          onClick={() => setUpcomingOnly(!upcomingOnly)}
        >
          {upcomingOnly ? "Show All" : "Show Upcoming Only"}
        </Button>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Link key={event.id} href={`/events/${event.id}`}>
            <EnterpriseCard variant="default" hover className="h-full">
              <EnterpriseCardHeader>
                <div className="flex items-start justify-between mb-2">
                  <EnterpriseCardTitle className="text-lg">{event.title}</EnterpriseCardTitle>
                  <span className="px-2 py-1 text-xs bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 rounded">
                    {event.eventType}
                  </span>
                </div>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {event.description}
                </p>
                <div className="space-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(event.startTime).toLocaleTimeString()}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.location}</span>
                    </div>
                  )}
                  {event.isVirtual && (
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4" />
                      <span>Virtual Event</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{event._count?.registrations || 0} registered</span>
                  </div>
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </main>
  );
}

export default function Events() {
  return (
    <ProtectedRoute>
      <EventsPage />
    </ProtectedRoute>
  );
}

