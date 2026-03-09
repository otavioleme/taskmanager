"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";
import { Comment } from "@/types";

interface Props {
  taskId: string;
  taskTitle: string;
  taskDescription: string;
  onClose: () => void;
}

export default function TaskModal({ taskId, taskTitle, taskDescription, onClose }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/comments/task/${taskId}`);
      setComments(response.data);
    } catch {
      console.error("Error fetching comments");
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/api/comments", {
        content: newComment,
        taskItemId: taskId,
      });
      setComments([...comments, response.data]);
      setNewComment("");
    } catch {
      console.error("Error adding comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/api/comments/${commentId}`);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch {
      console.error("Error deleting comment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-800">{taskTitle}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl transition"
          >
            ✕
          </button>
        </div>

        {/* Description */}
        {taskDescription && (
          <p className="text-gray-600 text-sm mb-4">{taskDescription}</p>
        )}

        <hr className="mb-4" />

        {/* Comments */}
        <h3 className="font-semibold text-gray-700 mb-3">Comments</h3>

        <div className="flex flex-col gap-2 mb-4 max-h-48 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="bg-gray-50 rounded p-3">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-blue-600">
                    {comment.userName}
                  </span>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-400 hover:text-red-600 text-xs transition"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-700 mt-1">{comment.content}</p>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Add Comment */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
            placeholder="Write a comment..."
          />
          <button
            onClick={handleAddComment}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}