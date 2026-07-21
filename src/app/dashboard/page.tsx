"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CallAnalyticsDashboard, { CallData } from "@/components/ui/CallAnalyticsDashboard";

function DashboardContent() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get("id");

  const [data, setData] = useState<CallData | null>(null);
  const [allRecords, setAllRecords] = useState<CallData[]>([]);
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

        const userRecords = analyticsData.analytics || [];
        setAllRecords(userRecords);

        // Determine which specific record to show
        if (recordId) {
          const selected = (userRecords || []).find((r: any) => String(r.id) === String(recordId));
          if (!selected) {
            setError("Call analytics record not found or you do not have permission to view it.");
          } else {
            setData(selected as CallData);
          }
        } else {
          // If no specific ID is requested, default to the latest call for this user/admin
          if (userRecords.length > 0) {
            // Since they are ordered ascending: true, the last one is the latest
            setData(userRecords[userRecords.length - 1]);
          } else {
            setData(null);
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [recordId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse">Loading analytics dashboard...</div>
      </div>
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

  if (!data) {
    return (
      <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-center h-64 text-slate-400">
          No call analytics data available. Run a campaign to generate insights!
        </div>
      </main>
    );
  }

  return (
    <main className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
      <CallAnalyticsDashboard data={data} allRecords={allRecords} />
    </main>
  );
}

export default function CallAnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
}
