"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FolderGit2,
  ListTodo,
} from "lucide-react";

export default function DashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: async () => {
      const res = await api.get("/dashboard/stats");
      return res.data;
    },
  });

  if (isLoading)
    return <div className="text-center mt-10">Loading dashboard...</div>;
  if (error)
    return (
      <div className="text-center mt-10 text-red-500">
        Failed to load stats. Please log in again.
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 italic">
        Dashboard Overview
      </h1>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-3xl border-l-4 border-r-4 border-black p-5 flex items-center">
          <FolderGit2 className="h-6 w-6 text-gray-400" />
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Total Projects</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalProjects}
            </p>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-3xl border-l-4 border-r-4 border-black p-5 flex items-center">
          <ListTodo className="h-6 w-6 text-gray-400" />
          <div className="ml-5">
            <p className="text-sm font-medium text-gray-500">Total Tasks</p>
            <p className="text-2xl font-semibold text-gray-900">
              {stats.totalTasks}
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-medium text-gray-900 mb-4">Task Status</h2>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white shadow rounded-3xl border-l-4 border-r-4 border-yellow-500 p-5 flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">TODO</p>
            <p className="text-2xl font-semibold text-yellow-500">
              {stats.taskStatus.TODO}
            </p>
          </div>
          <Clock className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="bg-white shadow rounded-3xl border-l-4 border-r-4 border-blue-500 p-5 flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">IN PROGRESS</p>
            <p className="text-2xl font-semibold text-blue-500">
              {stats.taskStatus.IN_PROGRESS}
            </p>
          </div>
          <Clock className="h-8 w-8 text-blue-500" />
        </div>
        <div className="bg-white shadow rounded-3xl border-l-4 border-r-4 border-green-500 p-5 flex justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">COMPLETED</p>
            <p className="text-2xl font-semibold text-green-500">
              {stats.taskStatus.COMPLETED}
            </p>
          </div>
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      </div>
    </div>
  );
}
