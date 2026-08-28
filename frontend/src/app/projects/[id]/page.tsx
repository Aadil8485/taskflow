"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Plus, Search, Trash2, Pencil } from "lucide-react";
import Link from "next/link";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "COMPLETED"]).default("TODO"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
  dueDate: z.string().optional(),
  assignedTo: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const queryClient = useQueryClient();

  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  // State for tracking edit mode.
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
  });

  //  Fetch Project Details
  const { data: project } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => (await api.get(`/projects/${projectId}`)).data,
  });

  //  Fetch Users for Assignment Dropdown
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => (await api.get("/users")).data,
  });

  //  Fetch Filtered Tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["tasks", projectId, filters],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (filters.search) queryParams.append("search", filters.search);
      if (filters.status) queryParams.append("status", filters.status);
      if (filters.priority) queryParams.append("priority", filters.priority);

      const res = await api.get(
        `/projects/${projectId}/tasks?${queryParams.toString()}`,
      );
      return res.data;
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: (newTask: TaskFormData) =>
      api.post(`/projects/${projectId}/tasks`, newTask),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      handleCloseForm();
    },
  });

  // Add update task mutation.
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TaskFormData }) =>
      api.patch(`/tasks/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      handleCloseForm();
    },
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => api.delete(`/tasks/${taskId}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] }),
  });

  // Helper function to close the form and reset state.
  const handleCloseForm = () => {
    setIsTaskFormOpen(false);
    setEditingTaskId(null);
    reset({
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "",
      assignedTo: "",
    });
  };

  // 4. Edit button click handler
  const handleEditClick = (task: any) => {
    setEditingTaskId(task.id);

    // Format date for HTML input (YYYY-MM-DD).
    const formattedDate = task.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0]
      : "";

    // Fill the form with existing data.
    reset({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: formattedDate,
      assignedTo: task.assignee?.id || "",
    });

    setIsTaskFormOpen(true);
    // Smooth scroll up to ensure the form is in view.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = (data: TaskFormData) => {
    if (!data.assignedTo) delete data.assignedTo;
    if (!data.dueDate) delete data.dueDate;

    if (data.dueDate) data.dueDate = new Date(data.dueDate).toISOString();

    // Condition: Update if editingTaskId exists, otherwise create.
    if (editingTaskId) {
      updateTaskMutation.mutate({ id: editingTaskId, data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6">
        <Link
          href="/projects"
          className="inline-flex items-center text-sm text-blue-600 hover:underline mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
        </Link>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 italic">
            {project?.name || "Loading Project..."}
          </h1>
          <button
            onClick={() => {
              if (isTaskFormOpen) {
                handleCloseForm();
              } else {
                setIsTaskFormOpen(true);
              }
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:text-black rounded-2xl hover:bg-green-600 text-sm font-medium transition duration-700"
          >
            <Plus className="w-4 h-4 mr-2" />{" "}
            {isTaskFormOpen ? "Cancel" : "Add Task"}
          </button>
        </div>
        <p className="text-gray-500 mt-1">{project?.description}</p>
      </div>

      {/* Task Creation/Edit Form */}
      {isTaskFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8">
          {/* Dynamic Title */}
          <h2 className="text-lg font-medium mb-4">
            {editingTaskId ? "Edit Task" : "Create New Task"}
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Task Title
              </label>
              <input
                {...register("title")}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={2}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                {...register("status")}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                {...register("priority")}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Assign To
              </label>
              <select
                {...register("assignedTo")}
                className="mt-1 block w-full px-3 py-2 border rounded-xl text-black"
              >
                <option value="">Unassigned</option>
                {users?.map((user: any) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 mt-2 flex gap-2">
              <button
                type="submit"
                disabled={
                  createTaskMutation.isPending || updateTaskMutation.isPending
                }
                className="px-4 py-2 bg-green-600 text-white hover:text-black rounded-2xl hover:bg-green-700 w-full sm:w-auto transition duration-700"
              >
                {/*  Dynamic Button Text */}
                {createTaskMutation.isPending || updateTaskMutation.isPending
                  ? "Saving..."
                  : editingTaskId
                    ? "Update Task"
                    : "Save Task"}
              </button>

              {/*Added a cancel button to the form.*/}
              <button
                type="button"
                onClick={handleCloseForm}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-2xl hover:bg-orange-300 w-full sm:w-auto transition duration-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters Section (Unchanged) */}
      <div className="bg-gray-100 p-4 rounded-3xl mb-6 flex flex-col sm:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            className="pl-10 pr-4 py-2 w-full border rounded-xl text-black"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        <select
          className="py-2 px-3 border rounded-xl text-black w-full sm:w-auto"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">All Statuses</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
        <select
          className="py-2 px-3 border rounded-xl text-black w-full sm:w-auto"
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
        >
          <option value="">All Priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>
      </div>

      {/* Task List */}
      {isLoadingTasks ? (
        <p>Loading tasks...</p>
      ) : tasksData?.data?.length === 0 ? (
        <p className="text-gray-500 text-center py-10 bg-white border rounded-3xl">
          No tasks found. Try adjusting filters or create a new one.
        </p>
      ) : (
        <div className="space-y-4">
          {tasksData?.data?.map((task: any) => (
            <div
              key={task.id}
              className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition"
            >
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {task.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {task.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      task.status === "COMPLETED"
                        ? "bg-green-100 text-green-800"
                        : task.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {task.status.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full font-medium ${
                      task.priority === "HIGH"
                        ? "bg-red-100 text-red-800"
                        : task.priority === "MEDIUM"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.priority} Priority
                  </span>
                  {task.assignee && (
                    <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
                      👤 {task.assignee.name}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* New Edit button added here. */}
                <button
                  onClick={() => handleEditClick(task)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                  title="Edit Task"
                >
                  <Pencil className="w-5 h-5" />
                </button>

                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this task?"))
                      deleteTaskMutation.mutate(task.id);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Delete Task"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
