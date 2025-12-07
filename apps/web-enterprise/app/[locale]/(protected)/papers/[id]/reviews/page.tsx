"use client";

import { ProtectedRoute } from "components/auth/ProtectedRoute";
import { useAuth } from "lib/auth/useAuth";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import { EnterpriseCard, EnterpriseCardContent } from "components/Card";
import { Button } from "components/Button/Button";
import { FileText, UserPlus, CheckCircle, Clock, XCircle, ArrowLeft, Star } from "lucide-react";
import Link from "next/link";

function PaperReviewsPage() {
  const { user, loading, isAdmin, isInstitutionAdmin } = useAuth();
  const params = useParams();
  const router = useRouter();
  const paperId = params.id as string;
  const [paper, setPaper] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    reviewerId: "",
    reviewType: "INTERNAL" as "INTERNAL" | "EXTERNAL" | "PEER"
  });
  const [users, setUsers] = useState<any[]>([]);
  const apiBase = useMemo(() => process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4312", []);

  useEffect(() => {
    if (user && paperId) {
      fetch(`${apiBase}/papers/${paperId}`, {
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          setPaper(data);
          setReviews(data.peerReviews || []);
        })
        .catch(err => console.error("Failed to fetch paper:", err));

      // Fetch users for reviewer assignment
      if (isAdmin || isInstitutionAdmin) {
        fetch(`${apiBase}/users`, {
          credentials: "include"
        })
          .then(res => res.json())
          .then(data => setUsers(data || []))
          .catch(err => console.error("Failed to fetch users:", err));
      }
    }
  }, [user, paperId, apiBase, isAdmin, isInstitutionAdmin]);

  const handleAssignReviewer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${apiBase}/papers/${paperId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(assignFormData)
      });

      if (response.ok) {
        const review = await response.json();
        setReviews([...reviews, review]);
        setShowAssignForm(false);
        router.refresh();
      } else {
        alert("Failed to assign reviewer");
      }
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      alert("Failed to assign reviewer");
    }
  };

  const handleSubmitReview = async (reviewId: string, score: number, comments: string) => {
    try {
      const response = await fetch(`${apiBase}/papers/reviews/${reviewId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ score, comments })
      });

      if (response.ok) {
        router.refresh();
      } else {
        alert("Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!paper) {
    return (
      <main className="mx-auto max-w-7xl px-5 py-8">
        <EnterpriseCard variant="glass">
          <EnterpriseCardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Paper not found</p>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </main>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-emerald-600" />;
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'DECLINED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const myReview = reviews.find((r: any) => r.reviewerId === user?.id);

  return (
    <main className="mx-auto max-w-7xl px-5 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link href={`/papers/${paperId}`} className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Paper
        </Link>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Peer Reviews
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {paper.title}
        </p>
      </div>

      {/* Assign Reviewer (Admin/Institution Admin) */}
      {(isAdmin || isInstitutionAdmin || paper.createdById === user?.id) && (
        <div className="mb-6">
          {!showAssignForm ? (
            <Button onClick={() => setShowAssignForm(true)}>
              <UserPlus className="mr-2 h-5 w-5" />
              Assign Reviewer
            </Button>
          ) : (
            <EnterpriseCard variant="default">
              <EnterpriseCardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Assign Peer Reviewer
                </h3>
                <form onSubmit={handleAssignReviewer} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Reviewer
                    </label>
                    <select
                      required
                      value={assignFormData.reviewerId}
                      onChange={(e) => setAssignFormData({ ...assignFormData, reviewerId: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="">Select reviewer...</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.email})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Review Type
                    </label>
                    <select
                      required
                      value={assignFormData.reviewType}
                      onChange={(e) => setAssignFormData({ ...assignFormData, reviewType: e.target.value as any })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="INTERNAL">Internal Review</option>
                      <option value="EXTERNAL">External Review</option>
                      <option value="PEER">Peer Review</option>
                    </select>
                  </div>
                  <div className="flex gap-4">
                    <Button type="submit">Assign Reviewer</Button>
                    <Button type="button" intent="secondary" onClick={() => setShowAssignForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </EnterpriseCardContent>
            </EnterpriseCard>
          )}
        </div>
      )}

      {/* My Review */}
      {myReview && myReview.status === 'PENDING' && (
        <EnterpriseCard variant="glass" className="mb-6 border-2 border-brand-500/30">
          <EnterpriseCardContent className="p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Your Review Assignment
            </h3>
            <ReviewSubmissionForm
              review={myReview}
              onSubmit={(score, comments) => handleSubmitReview(myReview.id, score, comments)}
            />
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <EnterpriseCard key={review.id} variant="default" hover>
              <EnterpriseCardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(review.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {review.reviewer?.fullName || "Unknown Reviewer"}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {review.reviewType} Review
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    review.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' :
                    review.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                    review.status === 'DECLINED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {review.status.replace('_', ' ')}
                  </span>
                </div>
                {review.score !== null && (
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      {review.score}/10
                    </span>
                  </div>
                )}
                {review.comments && (
                  <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800 mb-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {review.comments}
                    </p>
                  </div>
                )}
                {review.submittedAt && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Submitted: {new Date(review.submittedAt).toLocaleDateString()}
                  </p>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          ))
        ) : (
          <EnterpriseCard variant="glass">
            <EnterpriseCardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No reviews assigned yet</p>
            </EnterpriseCardContent>
          </EnterpriseCard>
        )}
      </div>
    </main>
  );
}

function ReviewSubmissionForm({ review, onSubmit }: { review: any; onSubmit: (score: number, comments: string) => void }) {
  const [score, setScore] = useState(0);
  const [comments, setComments] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (score > 0 && comments.trim()) {
      onSubmit(score, comments);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Score (1-10)
        </label>
        <input
          type="number"
          min="1"
          max="10"
          required
          value={score}
          onChange={(e) => setScore(parseInt(e.target.value))}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Comments
        </label>
        <textarea
          required
          rows={6}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          placeholder="Provide detailed feedback..."
        />
      </div>
      <Button type="submit">Submit Review</Button>
    </form>
  );
}

export default function PaperReviews() {
  return (
    <ProtectedRoute>
      <PaperReviewsPage />
    </ProtectedRoute>
  );
}

