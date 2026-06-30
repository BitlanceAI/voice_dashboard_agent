"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const email = sessionStorage.getItem("billing_user_email");
      setUserEmail(email);
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-slate-950">
        <div className="animate-pulse text-slate-400 font-medium">Verifying permissions...</div>
      </div>
    );
  }

  if (!userEmail) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-slate-950">
        <div className="w-16 h-16 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8 text-rose-400" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-100 mb-2">
          Access Restricted
        </h2>
        <p className="text-slate-400 max-w-md mb-8 text-sm">
          Please sign in or register to view this section.
        </p>
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-all font-semibold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
