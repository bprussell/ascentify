import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users, ClipboardCheck, AlertTriangle, TrendingUp,
  Plus, ArrowRight, ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import KPICard from "@/components/shared/KPICard";
import ProgressChannel from "@/components/shared/ProgressChannel";
import StatusBadge from "@/components/shared/StatusBadge";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [hires, setHires] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [me, h, t, f] = await Promise.all([
          base44.auth.me(),
          base44.entities.NewHire.list("-created_date", 50),
          base44.entities.OnboardingTask.list("-created_date", 200),
          base44.entities.Feedback.list("-created_date", 50),
        ]);
        setUser(me);
        setHires(h);
        setTasks(t);
        setFeedback(f);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" />
      </div>
    );
  }

  const activeHires = hires.filter(h => h.status !== "completed");
  const completedTasks = tasks.filter(t => t.status === "completed").length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const blockedTasks = tasks.filter(t => t.status === "blocked").length;
  const avgSatisfaction = feedback.length > 0
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "—";
  const todayHires = hires.filter(h => {
    const sd = new Date(h.start_date);
    const today = new Date();
    return sd.toDateString() === today.toDateString();
  });

  // Per-hire completion
  const hireProgress = activeHires.slice(0, 8).map(hire => {
    const hireTasks = tasks.filter(t => t.new_hire_id === hire.id);
    const done = hireTasks.filter(t => t.status === "completed").length;
    const pct = hireTasks.length > 0 ? Math.round((done / hireTasks.length) * 100) : 0;
    return { ...hire, tasksDone: done, tasksTotal: hireTasks.length, pct };
  });

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-slate-900">
          {greeting}, {firstName}
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {todayHires.length > 0
            ? `You have ${todayHires.length} new hire${todayHires.length > 1 ? "s" : ""} arriving today, with ${blockedTasks} task${blockedTasks !== 1 ? "s" : ""} flagged as blocked.`
            : `${activeHires.length} active onboarding${activeHires.length !== 1 ? "s" : ""} in progress. ${blockedTasks} blocked task${blockedTasks !== 1 ? "s" : ""}.`
          }
        </p>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={TrendingUp} label="Completion Rate" value={`${completionRate}%`} subtitle={`${completedTasks} of ${totalTasks} tasks`} color="mint" delay={0} />
        <KPICard icon={Users} label="Active Onboardings" value={activeHires.length} subtitle={`${todayHires.length} starting today`} color="lavender" delay={0.05} />
        <KPICard icon={AlertTriangle} label="Blocked Tasks" value={blockedTasks} subtitle="Requires attention" color="coral" delay={0.1} />
        <KPICard icon={ClipboardCheck} label="Satisfaction" value={avgSatisfaction} subtitle="Average rating /5" color="ochre" delay={0.15} />
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cohort Progress */}
        <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900">Onboarding Progress</h2>
            <Link to="/new-hires">
              <Button variant="ghost" size="sm" className="text-mint-dark hover:text-mint-dark hover:bg-mint-50">
                View all <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {hireProgress.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-slate-400">No active onboardings yet</p>
              <Link to="/new-hires">
                <Button size="sm" className="mt-3 bg-mint hover:bg-mint-dark text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add New Hire
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {hireProgress.map((h, i) => (
                <Link key={h.id} to={`/checklists?hire=${h.id}`} className="block group">
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-lavender-soft to-mint-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-slate-700">
                        {h.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-medium text-slate-700 truncate group-hover:text-mint-dark transition-colors">
                          {h.full_name}
                        </p>
                        <span className="text-xs font-semibold text-slate-500 ml-2">{h.pct}%</span>
                      </div>
                      <ProgressChannel value={h.pct} color={h.pct >= 75 ? "mint" : "lavender"} delay={i * 0.05} />
                      <p className="text-xs text-slate-400 mt-1">{h.tasksDone}/{h.tasksTotal} tasks · {h.role_title} · {h.department}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions + recent */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link to="/new-hires?new=true" className="block">
                <Button className="w-full justify-start bg-mint hover:bg-mint-dark text-white" size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add New Hire
                </Button>
              </Link>
              <Link to="/training" className="block">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" /> Schedule Training
                </Button>
              </Link>
              <Link to="/resources" className="block">
                <Button variant="outline" className="w-full justify-start border-slate-200 text-slate-600 hover:bg-slate-50" size="sm">
                  <ArrowRight className="w-4 h-4 mr-2" /> Upload Resource
                </Button>
              </Link>
            </div>
          </div>

          {/* Recent Feedback */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">Recent Feedback</h2>
              <Link to="/feedback">
                <Button variant="ghost" size="sm" className="text-lavender-deep hover:text-lavender-deep hover:bg-lavender-50">
                  View all
                </Button>
              </Link>
            </div>
            {feedback.length === 0 ? (
              <p className="text-sm text-slate-400">No feedback yet</p>
            ) : (
              <div className="space-y-3">
                {feedback.slice(0, 4).map(f => (
                  <div key={f.id} className="flex items-start gap-3">
                    <div className="flex gap-0.5 mt-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= (f.rating || 0) ? "bg-mint" : "bg-slate-200"}`} />
                      ))}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">{f.new_hire_name || "Anonymous"}</p>
                      <p className="text-xs text-slate-400 truncate">{f.comment || "No comment"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}