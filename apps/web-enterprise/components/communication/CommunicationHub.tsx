"use client";

import { useState } from "react";
import { EnterpriseCard, EnterpriseCardHeader, EnterpriseCardTitle, EnterpriseCardContent } from "components/Card";
import { 
  MessageCircle, 
  MessageSquare,
  VideoIcon,
  CalendarDays,
  UsersRound,
  BookOpen,
  ArrowRight,
  Send,
  Users,
  Book,
  Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const communicationFeatures = [
  {
    id: "messaging",
    title: "Direct Messaging",
    description: "Send encrypted one-to-one and group messages with real-time delivery",
    icon: MessageCircle,
    href: "/messaging",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20",
    stats: "Secure & Encrypted"
  },
  {
    id: "forums",
    title: "Discussion Forums",
    description: "Join topic-based discussions, share ideas, and collaborate on research topics",
    icon: MessageSquare,
    href: "/forums",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20",
    stats: "Threaded Discussions"
  },
  {
    id: "meetings",
    title: "Virtual Meetings",
    description: "Schedule and join virtual meetings with automatic transcription and recording",
    icon: VideoIcon,
    href: "/meetings",
    color: "from-emerald-500 to-teal-500",
    bgColor: "from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20",
    stats: "AI Transcripts"
  },
  {
    id: "events",
    title: "Events & Webinars",
    description: "Discover and register for workshops, conferences, hackathons, and webinars",
    icon: CalendarDays,
    href: "/events",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20",
    stats: "Live & Recorded"
  },
  {
    id: "communities",
    title: "Community Channels",
    description: "Join domain-specific communities and connect with peers in your field",
    icon: UsersRound,
    href: "/communities",
    color: "from-indigo-500 to-blue-500",
    bgColor: "from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/20",
    stats: "Domain-Specific"
  },
  {
    id: "knowledge",
    title: "Knowledge Base",
    description: "Publish articles, share insights, and access expert knowledge resources",
    icon: BookOpen,
    href: "/knowledge",
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20",
    stats: "Expert Insights"
  }
];

export function CommunicationHub() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              Communication & Networking
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              Connect, collaborate, and share knowledge with your research community
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <MessageCircle className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Unread Messages</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <VideoIcon className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Upcoming Meetings</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <CalendarDays className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Events This Week</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="gradient" className="text-center">
          <EnterpriseCardContent className="py-4">
            <UsersRound className="h-6 w-6 text-brand-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-white">00</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Communities</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {/* Interactive Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {communicationFeatures.map((feature, index) => {
          const Icon = feature.icon;
          const isHovered = hoveredCard === feature.id;
          
          return (
            <Link key={feature.id} href={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(feature.id)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                <EnterpriseCard
                  variant="default"
                  hover
                  glow
                  className={`h-full bg-gradient-to-br ${feature.bgColor} border-2 transition-all duration-300 ${
                    isHovered ? "border-brand-500 shadow-xl scale-105" : "border-transparent"
                  }`}
                >
                  <EnterpriseCardContent className="p-6">
                    {/* Icon */}
                    <motion.div
                      animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
                    >
                      <Icon className="h-8 w-8 text-white" />
                    </motion.div>

                    {/* Title */}
                    <EnterpriseCardTitle className="text-xl mb-2">
                      {feature.title}
                    </EnterpriseCardTitle>

                    {/* Description */}
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {feature.description}
                    </p>

                    {/* Stats Badge */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs font-medium text-brand-600 dark:text-brand-400 bg-brand-100 dark:bg-brand-900/30 px-3 py-1 rounded-full">
                        {feature.stats}
                      </span>
                      <motion.div
                        animate={isHovered ? { x: 5 } : { x: 0 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <ArrowRight className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                      </motion.div>
                    </div>
                  </EnterpriseCardContent>
                </EnterpriseCard>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <EnterpriseCard variant="glass" hover>
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-500/10">
                <Send className="h-6 w-6 text-brand-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Quick Actions
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Start a conversation, schedule a meeting, or create an event
                </p>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="glass" hover>
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10">
                <Users className="h-6 w-6 text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Network & Connect
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Join communities and connect with researchers in your field
                </p>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard variant="glass" hover>
          <EnterpriseCardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Book className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  Share Knowledge
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Publish articles and share your expertise with the community
                </p>
              </div>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>
    </div>
  );
}

