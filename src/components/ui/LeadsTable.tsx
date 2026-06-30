"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Search, Phone } from "lucide-react";
import type { CallData } from "@/components/ui/CallAnalyticsDashboard";

export interface LeadRecord extends Partial<CallData> {
  id: string | number;
  created_at: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  summary?: string;
  sentiment_score?: number;
  confidence?: number;
  key_topics?: string[] | any;
}

export default function LeadsTable({ leads }: { leads: LeadRecord[] | null }) {
  const [search, setSearch] = useState("");

  if (!leads) {
    return (
      <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md p-8 text-center text-slate-500 dark:text-slate-400">
        <div className="animate-pulse">Loading leads data...</div>
      </div>
    );
  }

  const filtered = leads.filter((l) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (l.customer_name ?? "").toLowerCase().includes(q) ||
      (l.customer_phone ?? "").toLowerCase().includes(q) ||
      (l.call_outcome ?? "").toLowerCase().includes(q) ||
      (l.overall_sentiment ?? "").toLowerCase().includes(q)
    );
  });

  const getSentimentIcon = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return <TrendingUp  className="w-4 h-4 text-emerald-500" />;
      case "negative": return <TrendingDown className="w-4 h-4 text-rose-500" />;
      default:         return <Minus        className="w-4 h-4 text-slate-400 dark:text-slate-500" />;
    }
  };

  const getLevelBadge = (level?: string) => {
    switch (level?.toLowerCase()) {
      case "high":   return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "medium": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "low":    return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:       return "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getSentimentBadge = (sentiment?: string) => {
    switch (sentiment) {
      case "positive": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "negative": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:         return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const safeTopics = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
    return [];
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, outcome, sentiment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-md"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md p-8 text-center text-slate-500 dark:text-slate-400">
          No leads found.
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 backdrop-blur-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wide">Customer</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Date</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Call Outcome</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Interest</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Intent</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Sentiment</th>
                  <th className="px-6 py-4 font-bold tracking-wide">Key Topics</th>
                  <th className="px-6 py-4 font-bold tracking-wide text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                {filtered.map((lead) => {
                  const topics = safeTopics(lead.key_topics).slice(0, 3);
                  return (
                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 min-w-[160px]">
                        <div className="font-bold text-slate-900 dark:text-slate-200">{lead.customer_name || "Unknown"}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3" />
                          {lead.customer_phone || "No phone"}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">
                        {new Date(lead.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <span className="capitalize font-medium text-slate-700 dark:text-slate-300">
                          {(lead.call_outcome || "Unknown").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelBadge(lead.interest_level)}`}>
                          {lead.interest_level || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getLevelBadge(lead.buying_intent)}`}>
                          {lead.buying_intent || "—"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getSentimentIcon(lead.overall_sentiment)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${getSentimentBadge(lead.overall_sentiment)}`}>
                            {lead.overall_sentiment || "—"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {topics.length > 0 ? topics.map((t: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                              {t}
                            </span>
                          )) : <span className="text-slate-500 text-xs">—</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/dashboard?id=${lead.id}`}
                          className="inline-flex items-center gap-1 text-cyan-600 hover:text-cyan-500 dark:text-cyan-400 dark:hover:text-cyan-300 font-bold transition-colors"
                        >
                          View Analytics
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 text-right">
            Showing {filtered.length} of {leads.length} leads
          </div>
        </div>
      )}
    </div>
  );
}
