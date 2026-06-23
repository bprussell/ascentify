import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck, Check, Circle, AlertCircle, Clock, Plus,
  ChevronDown, ChevronUp, FileText, BookOpen, Users as UsersIcon,
  Monitor, Shield, MoreHorizontal, Trash2, Edit, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressChannel from "@/components/shared/ProgressChannel";
import EmptyState from "@/components/shared/EmptyState";

const catIcons = {
  documentation: FileText,
  training: BookOpen,
  meeting: UsersIcon,
  setup: Monitor,
  compliance: Shield,
  other: Circle,
};

export default function Checklists() {
  const [searchParams] = useSearchParams();
  const selectedHireId = searchParams.get("hire");
  const [hires, setHires] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeHire, setActiveHire] = useState(null);
  const [expandedTask, setExpandedTask] = useState(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", category: "other", priority: "medium", due_date: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [h, t] = await Promise.all([
        base44.entities.NewHire.list("-created_date", 100),
        base44.entities.OnboardingTask.list("order", 500),
      ]);
      setHires(h);
      setTasks(t);
      if (selectedHireId && !activeHire) {
        const found = h.find(x => x.id === selectedHireId);
        if (found) setActiveHire(found);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (selectedHireId && hires.length > 0 && !activeHire) {
      const found = hires.find(x => x.id === selectedHireId);
      if (found) setActiveHire(found);
    }
  }, [selectedHireId, hires]);

  const hireTasks = activeHire ? tasks.filter(t => t.new_hire_id === activeHire.id) : [];
  const completedCount = hireTasks.filter(t => t.status === "completed").length;
  const pct = hireTasks.length > 0 ? Math.round((completedCount / hireTasks.length) * 100) : 0;
  const totalPoints = hireTasks.reduce((s, t) => s + (t.status === "completed" ? (t.points || 10) : 0), 0);
  const maxPoints = hireTasks.reduce((s, t) => s + (t.points || 10), 0);

  const toggleTask = async (task) => {
    const newStatus = task.status === "completed" ? "pending" : "completed";
    await base44.entities.OnboardingTask.update(task.id, { status: newStatus });
    // Also update hire status
    if (activeHire) {
      const updatedTasks = hireTasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t);
      const allDone = updatedTasks.every(t => t.status === "completed");
      const anyStarted = updatedTasks.some(t => t.status === "completed" || t.status === "in_progress");
      const hireStatus = allDone ? "completed" : anyStarted ? "in_progress" : "pending";
      if (activeHire.status !== hireStatus) {
        await base44.entities.NewHire.update(activeHire.id, { status: hireStatus });
      }
    }
    load();
  };

  const handleApproveAll = async () => {
    const pending = hireTasks.filter(t => t.status !== "completed");
    if (pending.length === 0) return;
    setSaving(true);
    for (const t of pending) {
      await base44.entities.OnboardingTask.update(t.id, { status: "completed" });
    }
    if (activeHire) await base44.entities.NewHire.update(activeHire.id, { status: "completed" });
    await load();
    setSaving(false);
  };

  const handleAddTask = async () => {
    if (!taskForm.title || !activeHire) return;
    setSaving(true);
    await base44.entities.OnboardingTask.create({
      ...taskForm,
      new_hire_id: activeHire.id,
      status: "pending",
      points: 10,
      order: hireTasks.length + 1,
    });
    setTaskForm({ title: "", description: "", category: "other", priority: "medium", due_date: "" });
    setShowTaskForm(false);
    await load();
    setSaving(false);
  };

  const handleDeleteTask = async (taskId) => {
    await base44.entities.OnboardingTask.delete(taskId);
    load();
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Onboarding Checklists</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Hire List */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Select Employee</p>
            <div className="space-y-1 max-h-[calc(100vh-240px)] overflow-y-auto">
              {hires.length === 0 ? (
                <p className="text-sm text-slate-400 p-2">No new hires yet</p>
              ) : (
                hires.map(h => {
                  const isActive = activeHire?.id === h.id;
                  return (
                    <button
                      key={h.id}
                      onClick={() => setActiveHire(h)}
                      className={`w-full text-left px-3 py-2.5 rounded-xl transition-all text-sm ${
                        isActive ? "bg-mint-50 text-mint-dark font-medium" : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <p className="font-medium truncate">{h.full_name}</p>
                      <p className="text-xs text-slate-400 truncate">{h.role_title}</p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Task Panel */}
        <div className="flex-1 min-w-0">
          {!activeHire ? (
            <EmptyState icon={ClipboardCheck} title="Select an employee" description="Choose an employee from the left panel to view their onboarding checklist." />
          ) : (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-lavender-soft to-mint-100 flex items-center justify-center">
                      <span className="text-lg font-bold text-slate-700">
                        {activeHire.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{activeHire.full_name}</h2>
                      <p className="text-sm text-slate-500">{activeHire.role_title} · {activeHire.department}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Started: {activeHire.start_date} {activeHire.manager_name && `· Manager: ${activeHire.manager_name}`}</p>
                    </div>
                  </div>
                  <StatusBadge status={activeHire.status} />
                </div>

                {/* Progress + Gamification */}
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Overall Progress</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-extrabold text-mint-dark">{pct}%</span>
                    </div>
                    <ProgressChannel value={pct} height="h-2.5" />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Tasks Done</p>
                    <p className="text-2xl font-extrabold text-lavender-deep">{completedCount}<span className="text-sm font-normal text-slate-400">/{hireTasks.length}</span></p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mb-1">Points Earned</p>
                    <p className="text-2xl font-extrabold text-ochre-sand">{totalPoints}<span className="text-sm font-normal text-slate-400">/{maxPoints}</span></p>
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-slate-900">Tasks</h3>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setShowTaskForm(true)} className="border-slate-200">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add Task
                    </Button>
                  </div>
                </div>

                {hireTasks.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-8">No tasks assigned yet.</p>
                ) : (
                  <div className="space-y-2">
                    {hireTasks.map(task => {
                      const CatIcon = catIcons[task.category] || Circle;
                      const isExpanded = expandedTask === task.id;
                      return (
                        <motion.div
                          key={task.id}
                          layout
                          className={`rounded-xl border transition-all ${
                            task.status === "completed" ? "bg-mint-50/30 border-mint/10" : "bg-white border-slate-100 hover:border-slate-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 px-4 py-3 cursor-pointer" onClick={() => setExpandedTask(isExpanded ? null : task.id)}>
                            <button onClick={(e) => { e.stopPropagation(); toggleTask(task); }} className="flex-shrink-0">
                              {task.status === "completed" ? (
                                <div className="w-6 h-6 rounded-full bg-mint flex items-center justify-center">
                                  <Check className="w-3.5 h-3.5 text-white" />
                                </div>
                              ) : task.status === "blocked" ? (
                                <div className="w-6 h-6 rounded-full bg-coral-50 flex items-center justify-center">
                                  <AlertCircle className="w-3.5 h-3.5 text-coral" />
                                </div>
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-slate-200 hover:border-mint transition-colors" />
                              )}
                            </button>
                            <CatIcon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${task.status === "completed" ? "text-slate-400 line-through" : "text-slate-700"}`}>
                                {task.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={task.priority} />
                              <span className="text-xs text-slate-400">{task.points || 10}pts</span>
                              {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                            </div>
                          </div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden"
                              >
                                <div className="px-4 pb-4 pt-1 ml-9 border-t border-slate-50">
                                  {task.description && <p className="text-sm text-slate-500 mb-2">{task.description}</p>}
                                  <div className="flex items-center gap-4 text-xs text-slate-400">
                                    {task.due_date && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Due: {task.due_date}</span>}
                                    {task.assigned_to && <span>Assigned to: {task.assigned_to}</span>}
                                  </div>
                                  <div className="flex items-center gap-2 mt-3">
                                    <Button size="sm" variant="outline" className="text-xs h-7 border-slate-200" onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}>
                                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                                    </Button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Approve All Footer */}
                {hireTasks.some(t => t.status !== "completed") && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                    <Button onClick={handleApproveAll} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                      {saving ? "Processing..." : "Approve All Pending"}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Task</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={taskForm.title} onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={taskForm.description} onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Optional description..." rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select value={taskForm.category} onValueChange={v => setTaskForm({ ...taskForm, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["documentation", "training", "meeting", "setup", "compliance", "other"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={taskForm.priority} onValueChange={v => setTaskForm({ ...taskForm, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["low", "medium", "high", "urgent"].map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={taskForm.due_date} onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowTaskForm(false)}>Cancel</Button>
              <Button onClick={handleAddTask} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                {saving ? "Adding..." : "Add Task"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}