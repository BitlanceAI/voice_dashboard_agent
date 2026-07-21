"use client";

import React, { useEffect, useState } from "react";
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
        const myCallIdsSet = new Set(calls.map((c: any) => String(c.call_id || '')).filter(Boolean));

        // 2. Fetch analytics securely from the backend API
        const analyticsRes = await fetch(`${BACKEND_URL}/billing/analytics`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const analyticsData = await analyticsRes.json();

        if (!analyticsData.success) {
          setError(analyticsData.error || "Failed to fetch analytics");
          setLoading(false);
          return;
        }

        const filteredLeads = analyticsData.analytics || [];
        // Sort descending by created_at since the API sorts ascending
        filteredLeads.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
