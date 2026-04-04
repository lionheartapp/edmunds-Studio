"use client"

import { useState, useCallback, useEffect } from "react"
import type { ApprovalComment } from "@/lib/oem-types"

interface CommentThreadProps {
  campaignId: string
  initialComments?: ApprovalComment[]
}

export default function CommentThread({ campaignId, initialComments = [] }: CommentThreadProps) {
  const [comments, setComments] = useState<ApprovalComment[]>(initialComments)
  const [authorName, setAuthorName] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch comments on mount
  useEffect(() => {
    if (initialComments.length > 0) return

    fetch(`/api/oem/comment?campaignId=${campaignId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comments) setComments(data.comments)
      })
      .catch(() => {})
  }, [campaignId, initialComments.length])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!authorName.trim() || !message.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/oem/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          authorName: authorName.trim(),
          message: message.trim(),
        }),
      })

      if (!response.ok) throw new Error("Failed to add comment")

      const comment: ApprovalComment = await response.json()
      setComments((prev) => [...prev, comment])
      setMessage("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add comment")
    } finally {
      setSubmitting(false)
    }
  }, [campaignId, authorName, message])

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-zinc-300">Comments</h3>

      {/* Existing comments */}
      {comments.length > 0 ? (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-6 h-6 rounded-full bg-eds-50/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-eds-50">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-zinc-200">{comment.authorName}</span>
                <span className="text-xs text-zinc-600">
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              <p className="text-sm text-zinc-300 pl-8">{comment.message}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-zinc-600">No comments yet. Be the first to share feedback.</p>
      )}

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-[1fr_2fr] gap-3">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Your name"
            maxLength={100}
            className="bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-eds-50 focus:ring-1 focus:ring-eds-50/30"
          />
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a comment..."
            maxLength={1000}
            className="bg-zinc-900/50 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-eds-50 focus:ring-1 focus:ring-eds-50/30"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={submitting || !authorName.trim() || !message.trim()}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            submitting || !authorName.trim() || !message.trim()
              ? "bg-zinc-800 text-zinc-500 cursor-not-allowed"
              : "bg-eds-50/20 text-eds-50 border border-eds-50/30 hover:bg-eds-50/30"
          }`}
        >
          {submitting ? "Posting..." : "Post Comment"}
        </button>
      </form>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  } catch {
    return ""
  }
}
