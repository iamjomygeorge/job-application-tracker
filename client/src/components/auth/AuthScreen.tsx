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
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-1000">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Marketing Text */}
        <div className="space-y-8 text-center md:text-left animate-in fade-in slide-in-from-left-8 duration-1000 delay-100">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground mb-4 leading-tight">
              Track Your <span className="text-primary">Applications</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-lg mx-auto md:mx-0">
              Stop losing track of your applications. Organize, track, and
              manage your job search journey in one beautiful dashboard.
            </p>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="glass-panel w-full max-w-md mx-auto rounded-2xl p-8 shadow-2xl backdrop-blur-xl bg-background/50 border border-border animate-in fade-in slide-in-from-right-8 duration-1000 delay-300">
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
                ? "Processing..."
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
