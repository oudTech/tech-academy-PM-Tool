"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, Zap, Code2, GitBranch, BarChart3, Github } from "lucide-react";
import Link from "next/link";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";

const features = [
  { icon: Code2, text: "Kanban boards & sprint planning" },
  { icon: GitBranch, text: "GitHub integration & PR tracking" },
  { icon: BarChart3, text: "Real-time analytics & burndown charts" },
  { icon: Zap, text: "Team collaboration & notifications" },
];

const demoAccounts = [
  { role: "Admin", email: "admin@techacademy.dev" },
  { role: "PM", email: "pm@techacademy.dev" },
  { role: "Dev", email: "dev1@techacademy.dev" },
];

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("error") === "OAuthNotLinked") {
      toast({
        title: "Access denied",
        description: "You must be invited by an Admin before signing in with Google or GitHub.",
        variant: "destructive",
      });
    }
  }, [searchParams, toast]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "admin@techacademy.dev", password: "password123" },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true);
    try {
      // Pre-flight: check email verification status before hitting Auth.js,
      // because Auth.js always returns a generic "CredentialsSignin" error
      // regardless of the actual failure reason.
      const statusRes = await fetch(
        `/api/auth/email-status?email=${encodeURIComponent(data.email)}`,
      );
      const { verified, status: userStatus } = await statusRes.json();

      if (userStatus === "DISABLED") {
        toast({
          title: "Account disabled",
          description: "Your account has been deactivated. Contact your Admin.",
          variant: "destructive",
        });
        return;
      }

      if (userStatus === "PENDING") {
        toast({
          title: "Invitation pending",
          description: "Check your email for the invitation link to set your password.",
          variant: "destructive",
        });
        return;
      }

      if (!verified) {
        toast({
          title: "Email not verified",
          description: (
            <span>
              Check your inbox for a verification link.{" "}
              <button
                className="underline font-medium"
                onClick={async () => {
                  await fetch(
                    `/api/auth/verify-email?email=${encodeURIComponent(data.email)}`,
                  );
                  toast({ title: "Verification email resent" });
                }}
              >
                Resend it
              </button>
            </span>
          ),
          variant: "destructive",
        });
        return;
      }

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error || !result?.ok) {
        toast({
          title: "Login failed",
          description: "Invalid email or password.",
          variant: "destructive",
        });
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    setOauthLoading(provider);
    try {
      await signIn(provider, { callbackUrl });
    } catch {
      toast({ title: "Error", description: "OAuth sign-in failed.", variant: "destructive" });
      setOauthLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-600/25 to-navy-900/30" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-navy-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-navy-700/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-navy-500 flex items-center justify-center">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">TechAcademy PM</h1>
            <p className="text-navy-300 text-xs">Solutions Hub</p>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-white leading-tight"
            >
              Build great products,
              <br />
              <span className="text-navy-400">ship faster.</span>
            </motion.h2>
            <p className="mt-4 text-slate-400 text-lg max-w-sm">
              The internal collaboration hub for the Tech Academy & Solutions Hub development team.
            </p>
          </div>
          <div className="space-y-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * i }}
                className="flex items-center gap-3"
              >
                <div className="h-8 w-8 rounded-lg bg-navy-500/20 border border-navy-500/30 flex items-center justify-center">
                  <f.icon className="h-4 w-4 text-navy-400" />
                </div>
                <span className="text-slate-300">{f.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex gap-6">
          {[["20+", "Tasks tracked"], ["6", "Team members"], ["3", "Active sprints"]].map(([n, l]) => (
            <div key={l} className="text-center">
              <div className="text-2xl font-bold text-white">{n}</div>
              <div className="text-slate-400 text-sm">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="h-8 w-8 rounded-lg bg-navy-500 flex items-center justify-center">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-white font-bold">TechAcademy PM</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Sign in</h2>
              <p className="text-slate-400 mt-1">Access your workspace</p>
            </div>

            {/* OAuth buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth("google")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {oauthLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleIcon />}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("github")}
                disabled={!!oauthLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium hover:bg-white/10 transition-colors disabled:opacity-50"
              >
                {oauthLoading === "github" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Github className="h-4 w-4" />}
                GitHub
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Demo quick-access */}
            <div>
              <p className="text-xs text-slate-500 mb-2 uppercase tracking-wider">Quick access</p>
              <div className="flex gap-2 flex-wrap">
                {demoAccounts.map((a) => (
                  <button
                    key={a.email}
                    type="button"
                    onClick={() => setValue("email", a.email)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-navy-500/10 border border-navy-500/20 text-navy-400 hover:bg-navy-500/20 transition-colors"
                  >
                    {a.role}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                  placeholder="you@techacademy.dev"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-slate-300">Password</label>
                  <Link href="/forgot-password" className="text-xs text-navy-400 hover:text-navy-300 transition-colors">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="w-full px-4 py-3 pr-12 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-navy-500 focus:border-transparent transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-navy-600 hover:bg-navy-500 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</> : "Sign in to workspace"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-500">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-navy-400 hover:text-navy-300 font-medium transition-colors">
                Create one
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
