import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="glass-panel p-10 rounded-2xl max-w-md w-full">
        <h2 className="text-6xl font-extrabold text-primary mb-4">404</h2>
        <h3 className="text-2xl font-bold text-foreground mb-3">
          Page Not Found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium shadow-lg transition-all"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
}
