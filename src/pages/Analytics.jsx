import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { BarChart3, Download, TrendingUp, TrendingDown, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import KPICard from "@/components/shared/KPICard";

const COLORS = ["#2DDDA8", "#A78BFA", "#FF6B6B", "#F5B080", "#6D48D7", "#1A8F6C"];

export default function Analytics() {
  const [hires, setHires] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const [h, t, f] = await Promise.all([
          base44.entities.NewHire.list("-created_date", 200),
          base44.entities.OnboardingTask.list("-created_date", 500),
          base44.entities.Feedback.list("-created_date", 200),
        ]);
        setHires(h);
        setTasks(t);
        setFeedback(f);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  // Compute analytics
  const totalHires = hires.length;
  const completedHires = hires.filter(h => h.status === "completed").length;
  const completionRate = totalHires > 0 ? Math.round((completedHires / totalHires) * 100) : 0;
  const avgSatisfaction = feedback.length > 0
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : 0;
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  // Department breakdown
  const deptMap = {};
  hires.forEach(h => {
    if (!deptMap[h.department]) deptMap[h.department] = { name: h.department, total: 0, completed: 0 };
    deptMap[h.department].total++;
    if (h.status === "completed") deptMap[h.department].completed++;
  });
  const deptData = Object.values(deptMap);

  // Task category breakdown
  const catMap = {};
  tasks.forEach(t => {
    const cat = t.category || "other";
    if (!catMap[cat]) catMap[cat] = { name: cat, count: 0, completed: 0 };
    catMap[cat].count++;
    if (t.status === "completed") catMap[cat].completed++;
  });
  const catData = Object.values(catMap);

  // Satisfaction trend (by week)
  const weekMap = {};
  feedback.forEach(f => {
    const w = f.week_number || 1;
    if (!weekMap[w]) weekMap[w] = { week: `Week ${w}`, total: 0, sum: 0 };
    weekMap[w].total++;
    weekMap[w].sum += (f.rating || 0);
  });
  const satisfactionTrend = Object.values(weekMap).map(w => ({
    ...w,
    avg: Number((w.sum / w.total).toFixed(1))
  })).sort((a, b) => parseInt(a.week.split(" ")[1]) - parseInt(b.week.split(" ")[1]));

  // Status distribution
  const statusMap = { pending: 0, in_progress: 0, completed: 0, overdue: 0 };
  hires.forEach(h => { if (statusMap[h.status] !== undefined) statusMap[h.status]++; });
  const statusData = Object.entries(statusMap).filter(([_, v]) => v > 0).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor onboarding effectiveness and identify bottlenecks</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} label="Total New Hires" value={totalHires} subtitle={`${completedHires} completed`} color="lavender" delay={0} />
        <KPICard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} subtitle="Onboarding completed" color="mint" delay={0.05} />
        <KPICard icon={BarChart3} label="Task Completion" value={`${taskCompletionRate}%`} subtitle={`${completedTasks} of ${tasks.length}`} color="ochre" delay={0.1} />
        <KPICard icon={TrendingUp} label="Avg Satisfaction" value={`${avgSatisfaction}/5`} subtitle={`From ${feedback.length} responses`} color="coral" delay={0.15} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Department Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="feature-card rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-4">Onboarding by Department</h3>
          {deptData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={deptData} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EB" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#6B6B72" }} />
                <YAxis tick={{ fontSize: 12, fill: "#6B6B72" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Bar dataKey="total" fill="#A78BFA" radius={[6, 6, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#2DDDA8" radius={[6, 6, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No data available</p>
          )}
        </motion.div>

        {/* Satisfaction Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="feature-card rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-4">Satisfaction Trend</h3>
          {satisfactionTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={satisfactionTrend}>
                <defs>
                  <linearGradient id="mintGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2DDDA8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2DDDA8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EB" />
                <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#6B6B72" }} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 12, fill: "#6B6B72" }} />
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Area type="monotone" dataKey="avg" stroke="#2DDDA8" strokeWidth={2} fill="url(#mintGrad)" name="Avg Rating" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No feedback data yet</p>
          )}
        </motion.div>

        {/* Task Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="feature-card rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-4">Task Categories</h3>
          {catData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={catData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No task data yet</p>
          )}
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="feature-card rounded-2xl p-6"
        >
          <h3 className="text-base font-semibold text-slate-800 mb-4">Hire Status Distribution</h3>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3}>
                  {statusData.map((entry, i) => {
                    const colorMap = { pending: "#F5B080", in_progress: "#A78BFA", completed: "#2DDDA8", overdue: "#FF6B6B" };
                    return <Cell key={i} fill={colorMap[entry.name] || COLORS[i]} />;
                  })}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-400 text-center py-12">No data yet</p>
          )}
        </motion.div>
      </div>
    </div>
  );
}