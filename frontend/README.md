# TaskFlow - Frontend

The frontend client for the TaskFlow application, built to provide a seamless, responsive, and intuitive user experience for managing projects and tasks.

## 🛠 Tech Stack

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS
- **State Management & Data Fetching:** TanStack Query (React Query)
- **Form Handling:** React Hook Form
- **Validation:** Zod
- **HTTP Client:** Axios

## ✨ Key Features

- **Responsive UI:** Clean and modern interface built with Tailwind CSS.
- **Optimistic Updates & Caching:** Powered by TanStack Query for a lightning-fast experience.
- **Form Validation:** Strict client-side validation using Zod to ensure data integrity before sending it to the backend.
- **Interactive Modals:** Edit forms and safe-delete confirmation prompts.

## 🚀 Getting Started

### Prerequisites

Make sure the **NestJS Backend** is running locally before starting the frontend.

### Installation

1. Navigate to the frontend directory:
   \`\`\`bash
   cd frontend
   \`\`\`

2. Install the dependencies:
   \`\`\`bash
   npm install
   \`\`\`

3. Configure Environment Variables:
   Create a \`.env.local\` file in the root of the \`frontend\` folder and add your backend API URL (if different from default):
   \`\`\`env
   NEXT_PUBLIC_API_URL=http://localhost:3000
   \`\`\`
   _(Note: Update the port if your NestJS backend runs on a different port)._

### Running the Application

Start the development server:
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
