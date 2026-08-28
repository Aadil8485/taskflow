import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-5xl mb-6 font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TaskFlow
        </h1>
        <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
          A powerful and simple project management tool. Organize tasks,
          collaborate with your team, and get things done faster.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 text-base font-medium rounded-2xl text-white bg-blue-600 hover:bg-blue-700 transition transition duration-700"
          >
            Log In
          </Link>
          <Link
            href="/register"
            className="px-8 py-3 text-base font-medium rounded-2xl text-blue-700 bg-blue-100 hover:bg-green-200 transition transition duration-700"
          >
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
