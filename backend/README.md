# TaskFlow - Task Management Application

A full-stack Task Management application built with Next.js, NestJS, and MySQL.

## Tech Stack Choices

- **Frontend:** Next.js (App Router), Tailwind CSS, React Hook Form, Zod (for validation), TanStack Query (React Query for state/API management).
- **Backend:** NestJS, REST API architecture.
- **Database & ORM:** MySQL, Prisma ORM.

## Setup Instructions

### 1. Clone the repository

\`\`\`bash
git clone <your-github-repo-link>
cd taskflow-app
\`\`\`

### 2. Backend Setup

\`\`\`bash
cd backend
npm install
\`\`\`

- Create a `.env` file in the backend folder and add your MySQL database connection string.
- Run Prisma Migrations to set up the MySQL database:
  \`\`\`bash
  npx prisma migrate dev
  \`\`\`
- Start the backend server:
  \`\`\`bash
  npm run start:dev
  \`\`\`

### 3. Frontend Setup

\`\`\`bash
cd ../frontend
npm install
npm run dev
\`\`\`

- The app will be running at `http://localhost:3000`

## API Endpoints

- `GET /projects` - Fetch all projects
- `POST /projects` - Create a new project
- `DELETE /projects/:id` - Delete a project and its tasks
- `GET /projects/:id/tasks` - Fetch tasks for a specific project
- `POST /projects/:projectId/tasks` - Create a task
- `PATCH /tasks/:id` - Update task status/details
- `DELETE /tasks/:id` - Delete a task

## Assumptions

- A local MySQL database is available and running on port 3306.
