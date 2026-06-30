"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import LeadsTable, { LeadRecord } from "@/components/ui/LeadsTable";

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const token = sessionStorage.getItem("billing_auth_token");
        const email = sessionStorage.getItem("billing_user_email");
        
        if (!token) {
          setError("Not logged in");
          setLoading(false);
          return;
        }

        const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://backend.bitlancetechhub.com/api";
        
        // 1. Fetch user's own call history to know which numbers they own
        const historyRes = await fetch(`${BACKEND_URL}/billing/call-history?limit=250`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historyData = await historyRes.json();
        
        if (!historyData.success) {
          setError(historyData.error || "Failed to fetch call history");
          setLoading(false);
          return;
        }

        const calls = historyData.calls || [];
        const normalize = (p: string) => p.replace(/^\+/, '').replace(/\s/g, '');
        const myPhonesSet = new Set(calls.map((c: any) => normalize(c.customer_number || '')).filter(Boolean));

        // 2. Fetch analytics from new Supabase
        if (!supabase) {
          setError("Database connection not initialized");
          setLoading(false);
          return;
        }

        const { data: analytics, error: sbError } = await supabase
          .from("call_analytics")
          .select("id, created_at, call_outcome, interest_level, buying_intent, overall_sentiment, customer_name, customer_phone, summary, sentiment_score, confidence, key_topics")
          .order("created_at", { ascending: false });

        if (sbError) {
          setError(sbError.message);
          setLoading(false);
          return;
        }

        // Check if the user has Admin rights
        const isAdmin = email === "itm.lotlite@gmail.com" || email === "bitlanceai@gmail.com" || email === "bookishalok@gmail.com";

        // 3. Filter analytics in memory: show all for admins, otherwise filter by my campaign phone numbers
        const filteredLeads = (analytics || []).filter((item: any) => {
          if (isAdmin) return true;
          if (!item.customer_phone) return false;
          return myPhonesSet.has(normalize(item.customer_phone));
        }) as LeadRecord[];

        setLeads(filteredLeads);
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center h-64 text-slate-400">
          <div className="animate-pulse">Loading leads pipeline...</div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center h-64 text-rose-400 font-semibold">
          Error: {error}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Leads Pipeline
        </h1>
        <p className="text-slate-400 mt-1">
          Track and manage your incoming calls and qualified prospects.
        </p>
      </div>

      <LeadsTable leads={leads} />
    </main>
  );
}
