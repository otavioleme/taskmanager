"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Board } from "@/types";

export default function DashboardPage() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchBoards();
  }, [isAuthenticated]);

  const fetchBoards = async () => {
    try {
      const response = await api.get("/api/boards");
      setBoards(response.data);
    } catch {
      console.error("Error fetching boards");
    }
  };

  const handleCreateBoard = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/api/boards", { name, description });
      setBoards([...boards, response.data]);
      setName("");
      setDescription("");
      setShowForm(false);
    } catch {
      console.error("Error creating board");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBoard = async (id: string) => {
    try {
      await api.delete(`/api/boards/${id}`);
      setBoards(boards.filter((b) => b.id !== id));
    } catch {
      console.error("Error deleting board");
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Task Manager</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm">Hello, {user?.name}</span>
          <button
            onClick={handleLogout}
            className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Boards</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            + New Board
          </button>
        </div>

        {/* Create Board Form */}
        {showForm && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Create New Board</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Board name"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="Description (optional)"
            />
            <div className="flex gap-2">
              <button
                onClick={handleCreateBoard}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Boards Grid */}
        {boards.length === 0 ? (
          <div className="text-center text-gray-500 mt-12">
            <p className="text-lg">No boards yet.</p>
            <p className="text-sm">Create your first board to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board.id}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3
                    onClick={() => router.push(`/board/${board.id}`)}
                    className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600 transition"
                  >
                    {board.name}
                  </h3>
                  <button
                    onClick={() => handleDeleteBoard(board.id)}
                    className="text-red-400 hover:text-red-600 text-sm transition"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500 mb-3">{board.description}</p>
                <button
                  onClick={() => router.push(`/board/${board.id}`)}
                  className="text-blue-600 text-sm hover:underline"
                >
                  Open Board →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}