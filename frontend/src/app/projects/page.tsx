"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Plus, Folder, ArrowRight, Trash2, Clock } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch existing projects from the API.
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await api.get("/projects");
      return res.data;
    },
  });

  // Mutation to create a new project.
  const createMutation = useMutation({
    mutationFn: (newProject: ProjectFormData) =>
      api.post("/projects", newProject),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
      setIsFormOpen(false);
      reset();
    },
  });

  // Mutation to delete a specific project.
  const deleteMutation = useMutation({
    mutationFn: (projectId: string) => api.delete(`/projects/${projectId}`),
    onSuccess: () => {
      // Refresh the projects list and dashboard stats after successful deletion.
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = (data: ProjectFormData) => {
    createMutation.mutate(data);
  };

  // Handler function with confirmation before deleting.
  const handleDelete = (projectId: string, projectName: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete the project "${projectName}"? All associated tasks will also be removed.`,
      )
    ) {
      deleteMutation.mutate(projectId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 italic">My Projects</h1>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:text-black rounded-2xl hover:bg-green-600 text-sm font-medium transition duration-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {isFormOpen ? "Cancel" : "New Project"}
        </button>
      </div>

      {/* New Project Creation Form */}
      {isFormOpen && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">
            Create New Project
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 max-w-lg"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                {...register("name")}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 text-black"
                placeholder="e.g. E-commerce Website"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description (Optional)
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-blue-500 text-black"
                placeholder="Briefly describe the project..."
              />
            </div>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="px-4 py-2 bg-green-600 text-white hover:text-black rounded-2xl hover:bg-green-700 text-sm font-medium disabled:bg-green-400 transition duration-700"
            >
              {createMutation.isPending ? "Creating..." : "Create Project"}
            </button>
          </form>
        </div>
      )}

      {/* Projects List */}
      {isLoading ? (
        <div className="text-gray-500">Loading projects...</div>
      ) : projects?.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
          <Folder className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No projects
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new project.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((project: any) => {
            // 1. ADDED LOGIC: Find the task with the nearest deadline
            let upcomingTask = null;
            if (project.tasks && project.tasks.length > 0) {
              // Filter out tasks that don't have a date
              const tasksWithDates = project.tasks.filter(
                (t: any) => t.dueDate,
              );

              if (tasksWithDates.length > 0) {
                // Sort the tasks so the closest date comes first (index 0)
                upcomingTask = tasksWithDates.sort(
                  (a: any, b: any) =>
                    new Date(a.dueDate).getTime() -
                    new Date(b.dueDate).getTime(),
                )[0];
              }
            }

            return (
              <div
                key={project.id}
                className="bg-white overflow-hidden shadow-sm rounded-3xl border hover:shadow-xl transition-shadow "
              >
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 truncate pr-2">
                      {project.name}
                    </h3>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-green-600">
                      Active
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                    {project.description || "No description provided."}
                  </p>

                  {/* 2. ADDED UI: Show the nearest task and its date/time */}
                  {upcomingTask && (
                    <div className="mt-4 flex flex-col bg-orange-50 border border-orange-100 p-3 rounded-xl">
                      <span className="text-xs font-bold text-orange-800 mb-1 truncate">
                        Urgent Task: {upcomingTask.title}
                      </span>
                      <div className="flex items-center text-xs font-medium text-orange-600">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(upcomingTask.dueDate).toLocaleString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          },
                        )}
                      </div>
                    </div>
                  )}

                  {/* Updated the bottom section to include the delete button */}
                  <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                    <Link
                      href={`/projects/${project.id}`}
                      className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      View Tasks <ArrowRight className="ml-1 w-4 h-4" />
                    </Link>

                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      disabled={deleteMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-md transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
