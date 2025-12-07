"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { EnterpriseKpiCard } from "components/Card";
import { Button } from "components/Button/Button";
import { Video, Calendar, Users, Clock, Plus, VideoIcon } from "lucide-react";
import Link from "next/link";

function MeetingsPage() {
  const { user, loading } = useAuth();
  const [meetings, setMeetings] = useState<any[]>([]);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (!user) return;
    loadMeetings();
  }, [user, apiBase, upcomingOnly]);

  const loadMeetings = async () => {
    try {
      const params = new URLSearchParams();
      if (upcomingOnly) params.append("upcoming", "true");

      const res = await fetch(`${apiBase}/meetings?${params}`, {
        credentials: "include"
      });
      if (res.ok) {
        const data = await res.json();
        const meetingsData = Array.isArray(data) 
          ? data 
          : (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data))
            ? data.data
            : [];
        setMeetings(meetingsData);
      } else {
        setMeetings([]);
      }
    } catch (error) {
      console.error("Failed to load meetings:", error);
      setMeetings([]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const upcomingCount = meetings.filter(m => new Date(m.startTime) > new Date()).length;
  const todayCount = meetings.filter(m => {
    const today = new Date();
    const meetingDate = new Date(m.startTime);
    return meetingDate.toDateString() === today.toDateString();
  }).length;

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Virtual Meetings</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and join virtual meetings</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule Meeting
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <EnterpriseKpiCard
          label="Upcoming Meetings"
          value={upcomingCount}
          icon={Calendar}
          trend="up"
          variant="gradient"
        />
        <EnterpriseKpiCard
          label="Today's Meetings"
          value={todayCount}
          icon={Clock}
          trend="neutral"
          variant="default"
        />
        <EnterpriseKpiCard
          label="Total Meetings"
          value={meetings.length}
          icon={Video}
          trend="neutral"
          variant="default"
        />
      </div>

      {/* Filter Toggle */}
      <div className="mb-6">
        <Button
          intent={upcomingOnly ? "primary" : "secondary"}
          size="sm"
          onClick={() => setUpcomingOnly(!upcomingOnly)}
        >
          {upcomingOnly ? "Show All" : "Show Upcoming Only"}
        </Button>
      </div>

      {/* Meetings List */}
      <div className="space-y-4">
        {meetings.map((meeting) => (
          <Link key={meeting.id} href={`/meetings/${meeting.id}`}>
            <EnterpriseCard variant="default" hover>
              <EnterpriseCardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <VideoIcon className="h-5 w-5 text-brand-600" />
                      <EnterpriseCardTitle className="text-xl">{meeting.title}</EnterpriseCardTitle>
                      <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded">
                        {meeting.meetingType}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {meeting.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(meeting.startTime).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{meeting.participants?.length || 0} participants</span>
                      </div>
                      {meeting.project && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-1 rounded">
                            {meeting.project.title}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  {meeting.meetingUrl && (
                    <Button size="sm" intent="primary">
                      Join
                    </Button>
                  )}
                </div>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      {meetings.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No meetings found</p>
        </div>
      )}
    </main>
  );
}

export default function Meetings() {
  return (
    <ProtectedRoute>
      <MeetingsPage />
    </ProtectedRoute>
  );
}

