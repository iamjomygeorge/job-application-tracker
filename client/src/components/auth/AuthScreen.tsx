"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function AuthScreen() {
  const searchParams = useSearchParams();
  const [authView, setAuthView] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const authParam = searchParams.get("auth");
    if (authParam === "login" || authParam === "signup") {
      setAuthView(authParam);
    }
  }, [searchParams]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    if (authView === "signup" && password !== confirmPassword) {
      setAuthError("Passwords do not match");
      setAuthLoading(false);
      return;
    }

    try {
      if (authView === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      setAuthError(errorMessage);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-8 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-300 delay-100">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight">
              Track Your <span className="text-primary">Applications</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
              Stop losing track of your applications. Organize, track, and
              manage your job search journey in one beautiful dashboard.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto md:mx-0 mt-8">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 text-primary">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Track All</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Keep all your applications in one place.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mb-3 text-purple-500">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-foreground mb-1">Insights</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Visualize your progress with stats.
              </p>
            </div>
          </div>
        </div>

        <div className="glass-panel w-full max-w-md mx-auto rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-background/50 border border-border animate-in fade-in slide-in-from-right-8 duration-300">
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {authView === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              {authView === "login"
                ? "Sign in to manage your applications"
                : "Start tracking your applications today"}
            </p>
          </div>

          {authError && (
            <div className="mb-6 rounded-lg bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-500">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                placeholder="Enter your password"
              />
            </div>
            {authView === "signup" && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="glass-input w-full rounded-xl px-4 py-3 text-foreground placeholder-gray-400 focus:ring-2 focus:ring-primary/50"
                  placeholder="Confirm your password"
                />
              </div>
            )}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {authLoading
                ? "Logging in..."
                : authView === "login"
                ? "Sign In"
                : "Sign Up"}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
            {authView === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setAuthView(authView === "login" ? "signup" : "login");
                setAuthError(null);
              }}
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              {authView === "login" ? "Sign up" : "Sign in instead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
