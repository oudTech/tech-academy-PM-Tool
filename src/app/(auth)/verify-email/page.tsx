"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, Zap, Mail } from "lucide-react";
import Link from "next/link";

type State = "loading" | "success" | "error" | "no-token";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [state, setState] = useState<State>(token ? "loading" : "no-token");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok) {
          setState("success");
          setMessage(data.message);
        } else {
          setState("error");
          setMessage(data.error ?? "Verification failed.");
        }
      } catch {
        setState("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center bg-white/5 border border-white/10 rounded-2xl p-10 backdrop-blur-sm"
      >
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="h-8 w-8 rounded-lg bg-navy-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold">TechAcademy PM</span>
        </div>

        {state === "loading" && (
          <>
            <div className="flex justify-center mb-6">
              <Loader2 className="h-12 w-12 text-navy-400 animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying your email…</h2>
            <p className="text-slate-400">Please wait a moment.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Email verified!</h2>
            <p className="text-slate-400 mb-8">Your account is now active. You can sign in.</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-navy-600 hover:bg-navy-500 text-white font-medium rounded-xl transition-colors"
            >
              Sign in to workspace
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                <XCircle className="h-8 w-8 text-red-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Verification failed</h2>
            <p className="text-slate-400 mb-8">{message}</p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
            >
              Back to sign in
            </Link>
          </>
        )}

        {state === "no-token" && (
          <>
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-navy-500/20 border border-navy-500/30 flex items-center justify-center">
                <Mail className="h-8 w-8 text-navy-400" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Check your inbox</h2>
            <p className="text-slate-400 mb-8">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-medium rounded-xl transition-colors"
            >
              Back to sign in
            </Link>
          </>
        )}
      </motion.div>
    </div>
  );
}
