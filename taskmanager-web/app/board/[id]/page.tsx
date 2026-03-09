"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Column, Task } from "@/types";
import TaskModal from "@/components/TaskModal";

export default function BoardPage() {
  const [columns, setColumns] = useState<Column[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [newColumnName, setNewColumnName] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState<Record<string, string>>({});
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const boardId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    fetchColumns();
  }, [isAuthenticated]);

  const fetchColumns = async () => {
    try {
      const response = await api.get(`/api/columns/board/${boardId}`);
      setColumns(response.data);
      for (const column of response.data) {
        fetchTasks(column.id);
      }
    } catch {
      console.error("Error fetching columns");
    }
  };

  const fetchTasks = async (columnId: string) => {
    try {
      const response = await api.get(`/api/tasks/column/${columnId}`);
      setTasks((prev) => ({ ...prev, [columnId]: response.data }));
    } catch {
      console.error("Error fetching tasks");
    }
  };

  const handleCreateColumn = async () => {
    if (!newColumnName.trim()) return;
    setLoading(true);
    try {
      const response = await api.post("/api/columns", {
        name: newColumnName,
        boardId,
      });
      setColumns([...columns, response.data]);
      setTasks((prev) => ({ ...prev, [response.data.id]: [] }));
      setNewColumnName("");
      setShowColumnForm(false);
    } catch {
      console.error("Error creating column");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (columnId: string) => {
    const title = newTaskTitle[columnId];
    if (!title?.trim()) return;
    try {
      const response = await api.post("/api/tasks", {
        title,
        description: "",
        columnId,
      });
      setTasks((prev) => ({
        ...prev,
        [columnId]: [...(prev[columnId] || []), response.data],
      }));
      setNewTaskTitle((prev) => ({ ...prev, [columnId]: "" }));
    } catch {
      console.error("Error creating task");
    }
  };

  const handleDeleteTask = async (taskId: string, columnId: string) => {
    try {
      await api.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => ({
        ...prev,
        [columnId]: prev[columnId].filter((t) => t.id !== taskId),
      }));
    } catch {
      console.error("Error deleting task");
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    try {
      await api.delete(`/api/columns/${columnId}`);
      setColumns(columns.filter((c) => c.id !== columnId));
      setTasks((prev) => {
        const updated = { ...prev };
        delete updated[columnId];
        return updated;
      });
    } catch {
      console.error("Error deleting column");
    }
  };

  const handleMoveTask = async (taskId: string, targetColumnId: string, currentColumnId: string) => {
    if (targetColumnId === currentColumnId) return;
    try {
      await api.put(`/api/tasks/${taskId}/move`, {
        columnId: targetColumnId,
        order: 0,
      });
      const task = tasks[currentColumnId].find((t) => t.id === taskId);
      if (!task) return;
      setTasks((prev) => ({
        ...prev,
        [currentColumnId]: prev[currentColumnId].filter((t) => t.id !== taskId),
        [targetColumnId]: [{ ...task, columnId: targetColumnId }, ...(prev[targetColumnId] || [])],
      }));
    } catch {
      console.error("Error moving task");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-white hover:text-blue-200 transition"
          >
            ← Back
          </button>
          <h1 className="text-xl font-bold">Board</h1>
        </div>
      </nav>

      <div className="p-6">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {/* Columns */}
          {columns.map((column) => (
            <div
              key={column.id}
              className="bg-gray-200 rounded-lg p-3 min-w-[280px] max-w-[280px]"
            >
              {/* Column Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-700">{column.name}</h3>
                <button
                  onClick={() => handleDeleteColumn(column.id)}
                  className="text-red-400 hover:text-red-600 text-xs transition"
                >
                  Delete
                </button>
              </div>

              {/* Tasks */}
              <div className="flex flex-col gap-2 mb-3">
                {(tasks[column.id] || []).map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded p-3 shadow-sm"
                  >
                    <div className="flex justify-between items-start">
                      <p
                        onClick={() => setSelectedTask(task)}
                        className="text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition"
                      >
                        {task.title}
                      </p>
                      <button
                        onClick={() => handleDeleteTask(task.id, column.id)}
                        className="text-red-400 hover:text-red-600 text-xs ml-2 transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Move task buttons */}
                    <div className="flex gap-1 mt-2 flex-wrap">
                      {columns
                        .filter((c) => c.id !== column.id)
                        .map((targetColumn) => (
                          <button
                            key={targetColumn.id}
                            onClick={() => handleMoveTask(task.id, targetColumn.id, column.id)}
                            className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded hover:bg-blue-200 transition"
                          >
                            → {targetColumn.name}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Task */}
              <div>
                <input
                  type="text"
                  value={newTaskTitle[column.id] || ""}
                  onChange={(e) =>
                    setNewTaskTitle((prev) => ({ ...prev, [column.id]: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="New task..."
                />
                <button
                  onClick={() => handleCreateTask(column.id)}
                  className="w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700 transition"
                >
                  + Add Task
                </button>
              </div>
            </div>
          ))}

          {/* Add Column */}
          <div className="min-w-[280px]">
            {showColumnForm ? (
              <div className="bg-gray-200 rounded-lg p-3">
                <input
                  type="text"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                  placeholder="Column name..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateColumn}
                    disabled={loading}
                    className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {loading ? "Adding..." : "Add"}
                  </button>
                  <button
                    onClick={() => setShowColumnForm(false)}
                    className="bg-gray-300 text-gray-700 text-sm px-3 py-1 rounded hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowColumnForm(true)}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-lg p-3 text-sm transition"
              >
                + Add Column
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          taskDescription={selectedTask.description}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}