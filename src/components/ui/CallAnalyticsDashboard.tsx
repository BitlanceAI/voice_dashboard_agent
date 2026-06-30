"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Minus, MessageSquare, AlertCircle,
  ThumbsUp, ThumbsDown, CheckCircle2, XCircle, User, Shield,
  Activity, PhoneCall, Target, Thermometer,
} from "lucide-react";

export interface CallData {
  id?: string | number;
  created_at?: string;
  overall_sentiment: "positive" | "neutral" | "negative";
  sentiment_score: number;
  confidence: number;
  customer_emotion: string;
  customer_name?: string | null;
  customer_phone?: string | null;
  interest_level: "low" | "medium" | "high";
  buying_intent: "low" | "medium" | "high";
  call_outcome: string;
  customer_satisfaction: "low" | "medium" | "high";
  objections: { id: number; text: string; handled: boolean }[] | any[];
  complaints: { id: number; text: string; resolved: boolean }[] | any[];
  key_topics: string[];
  positive_signals: string[];
  negative_signals: string[];
  summary: string;
}

export default function CallAnalyticsDashboard({ data, allRecords = [] }: { data: CallData | null; allRecords?: CallData[] }) {
  const [isLight, setIsLight] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const observer = new MutationObserver(() => {
        setIsLight(document.documentElement.classList.contains("light"));
      });
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
      setIsLight(document.documentElement.classList.contains("light"));
      return () => observer.disconnect();
    }
  }, []);

  // Build real sentiment trend from allRecords
  const sentimentTrendData = allRecords.length > 1
    ? allRecords.map((r, i) => ({
        time: r.created_at
          ? new Date(r.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })
          : `Call ${i + 1}`,
        score: r.sentiment_score ?? 0,
      }))
    : [
        { time: "Call 1", score: data?.sentiment_score ?? 0 },
      ];

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="text-slate-500 dark:text-slate-400 animate-pulse flex flex-col items-center">
          <Activity className="w-8 h-8 mb-4 text-cyan-500" />
          Loading analytics data...
        </div>
      </div>
    );
  }

  const getLevelBadge = (level: string) => {
    switch (level) {
      case "high":   return "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20";
      case "medium": return "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
      case "low":    return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
      default:       return "bg-slate-100 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const getSentimentBadge = (s: string) => {
    switch (s) {
      case "positive": return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
      case "negative": return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
      default:         return "bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  const sentimentIcon =
    data.overall_sentiment === "positive" ? <TrendingUp  className="w-5 h-5 text-emerald-500" /> :
    data.overall_sentiment === "negative" ? <TrendingDown className="w-5 h-5 text-rose-500" /> :
                                            <Minus        className="w-5 h-5 text-slate-400" />;

  const rawScore  = typeof data.sentiment_score === 'number' ? data.sentiment_score : 50;
  const pieScore  = rawScore > 0 ? rawScore : (data.overall_sentiment === 'positive' ? 75 : data.overall_sentiment === 'negative' ? 25 : 50);

  const sentimentPieData = [
    { name: "Score",     value: Math.max(1, pieScore),        color: pieScore >= 60 ? "#10b981" : pieScore >= 40 ? "#64748b" : "#f43f5e" },
    { name: "Remaining", value: Math.max(0, 100 - pieScore), color: isLight ? "#f1f5f9" : "#1e293b" },
  ];

  const safeParseArray = (val: any) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") { try { return JSON.parse(val); } catch { return []; } }
    return [];
  };

  const objections       = safeParseArray(data.objections);
  const complaints       = safeParseArray(data.complaints);
  const key_topics       = safeParseArray(data.key_topics);
  const positive_signals = safeParseArray(data.positive_signals);
  const negative_signals = safeParseArray(data.negative_signals);

  const confidenceVal  = data.confidence && data.confidence > 0 ? data.confidence : null;
  const scoreVal       = typeof data.sentiment_score === 'number' && data.sentiment_score > 0 ? data.sentiment_score : null;

  const kpis = [
    { label: "Overall Sentiment", value: data.overall_sentiment || "neutral", icon: sentimentIcon,                                   isBadge: true,  badgeCls: getSentimentBadge(data.overall_sentiment) },
    { label: "Sentiment Score",   value: scoreVal != null ? scoreVal : "—",   icon: <Activity   className="w-5 h-5 text-cyan-500" />, suffix: scoreVal != null ? "/100" : undefined },
    { label: "Confidence",        value: confidenceVal != null ? confidenceVal : "—", icon: <Shield className="w-5 h-5 text-indigo-500" />, suffix: confidenceVal != null ? "%" : undefined },
    { label: "Interest Level",    value: data.interest_level || "low",        icon: <Target     className="w-5 h-5 text-emerald-500" />, isBadge: true, badgeCls: getLevelBadge(data.interest_level) },
    { label: "Buying Intent",     value: data.buying_intent || "low",         icon: <Thermometer className="w-5 h-5 text-rose-500"  />, isBadge: true, badgeCls: getLevelBadge(data.buying_intent) },
    { label: "Satisfaction",      value: data.customer_satisfaction || "low", icon: <User       className="w-5 h-5 text-cyan-500" />,  isBadge: true, badgeCls: getLevelBadge(data.customer_satisfaction) },
  ];

  return (
    <div className="min-h-screen bg-transparent p-0 text-slate-900 dark:text-slate-100 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Call Analytics Dashboard
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Voice Dashboard Insights</p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/40 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <PhoneCall className="w-4 h-4 text-emerald-500" />
              Live Insights
            </span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi, i) => (
            <div key={i} className="bg-white dark:bg-slate-900/40 rounded-2xl p-5 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex flex-col justify-between">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-3">
                {kpi.icon}
                <span className="text-xs font-bold uppercase tracking-wider">{kpi.label}</span>
              </div>
              <div>
                {kpi.isBadge ? (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${kpi.badgeCls}`}>
                    {kpi.value}
                  </span>
                ) : (
                  <div className="flex items-baseline text-slate-900 dark:text-slate-100">
                    <span className="text-2xl font-black">{kpi.value}</span>
                    {kpi.suffix && <span className="ml-1 text-sm text-slate-500 font-medium">{kpi.suffix}</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Middle Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Summary */}
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
              <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                <MessageSquare className="w-5 h-5 text-cyan-500" />
                AI Call Summary
              </h2>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {data.summary || "No summary available."}
              </p>
            </div>

            {/* Charts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
                <h2 className="text-lg font-black mb-6 text-slate-900 dark:text-slate-100">Sentiment Over Time</h2>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={sentimentTrendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isLight ? "#e2e8f0" : "#334155"} />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isLight ? "#475569" : "#94a3b8" }} />
                      <YAxis domain={[-100, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: isLight ? "#475569" : "#94a3b8" }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", border: isLight ? "1px solid #cbd5e1" : "1px solid #1e293b", backgroundColor: isLight ? "#ffffff" : "#0f172a", color: isLight ? "#0f172a" : "#f1f5f9" }} />
                      <Line type="monotone" dataKey="score" stroke={isLight ? "#0891b2" : "#3b82f6"} strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: isLight ? "#ffffff" : "#0f172a" }} activeDot={{ r: 6, strokeWidth: 0 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md flex flex-col">
                <h2 className="text-lg font-black mb-4 text-slate-900 dark:text-slate-100">Sentiment Distribution</h2>
                <div className="flex-grow flex items-center justify-center relative">
                  <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={sentimentPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                          {sentimentPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: "8px", border: isLight ? "1px solid #cbd5e1" : "1px solid #1e293b", backgroundColor: isLight ? "#ffffff" : "#0f172a", color: isLight ? "#0f172a" : "#f1f5f9" }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className={`text-3xl font-black ${pieScore >= 60 ? 'text-emerald-650 dark:text-emerald-400' : pieScore >= 40 ? 'text-slate-700 dark:text-slate-300' : 'text-rose-650 dark:text-rose-400'}`}>
                        {scoreVal ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500">{scoreVal != null ? 'Score' : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
                <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400">
                  <ThumbsUp className="w-5 h-5" />
                  Positive Signals
                </h2>
                <ul className="space-y-3">
                  {positive_signals.length > 0 ? positive_signals.map((signal: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-555 shrink-0 mt-0.5" />
                      <span className="text-slate-750 dark:text-slate-300 text-sm">{signal}</span>
                    </li>
                  )) : <p className="text-sm text-slate-500">No positive signals detected.</p>}
                </ul>
              </div>

              <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
                <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-rose-600 dark:text-rose-400">
                  <ThumbsDown className="w-5 h-5" />
                  Negative Signals
                </h2>
                <ul className="space-y-3">
                  {negative_signals.length > 0 ? negative_signals.map((signal: string, i: number) => (
                    <li key={i} className="flex items-start gap-3">
                      <XCircle className="w-5 h-5 text-rose-555 shrink-0 mt-0.5" />
                      <span className="text-slate-750 dark:text-slate-300 text-sm">{signal}</span>
                    </li>
                  )) : <p className="text-sm text-slate-500">No negative signals detected.</p>}
                </ul>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md">
              <h2 className="text-lg font-black mb-4 text-slate-900 dark:text-slate-100">Qualification</h2>
              <div className="space-y-5">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Customer Emotion</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 capitalize">
                    {Array.isArray(data.customer_emotion)
                      ? (data.customer_emotion.length > 0 ? data.customer_emotion.join(", ") : "Unknown")
                      : (data.customer_emotion || "Unknown")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Call Outcome</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 capitalize border border-slate-200 dark:border-slate-700">
                    {(data.call_outcome || "Pending").replace("_", " ")}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-2">Key Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {key_topics.length > 0 ? key_topics.map((topic: string, i: number) => (
                      <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                        {topic}
                      </span>
                    )) : <span className="text-sm text-slate-500">No topics identified.</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-200 dark:border-slate-800/80 backdrop-blur-md min-h-[300px]">
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                    Objections
                  </h2>
                  {objections.length > 0 ? (
                    <ul className="space-y-3">
                      {objections.map((obj: any, i: number) => (
                        <li key={i} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{obj.text || obj}</span>
                          <span className={`text-xs font-bold ${obj.handled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                            {obj.handled ? "✓ Handled" : "⚠ Needs Follow-up"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No objections raised.</p>}
                </div>

                <div>
                  <h2 className="text-lg font-black flex items-center gap-2 mb-4 text-slate-900 dark:text-slate-100">
                    <XCircle className="w-5 h-5 text-rose-500" />
                    Complaints
                  </h2>
                  {complaints.length > 0 ? (
                    <ul className="space-y-3">
                      {complaints.map((comp: any, i: number) => (
                        <li key={i} className="flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700/50">
                          <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{comp.text || comp}</span>
                          <span className={`text-xs font-bold ${comp.resolved ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                            {comp.resolved ? "✓ Resolved" : "⚠ Unresolved"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sm text-slate-500">No complaints raised.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
