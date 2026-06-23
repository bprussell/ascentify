import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, X, Users, Mail, Briefcase, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/shared/StatusBadge";
import ProgressChannel from "@/components/shared/ProgressChannel";
import EmptyState from "@/components/shared/EmptyState";

const DEPARTMENTS = ["Engineering", "Marketing", "Sales", "HR", "Finance", "Operations", "Design", "Product"];

export default function NewHires() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hires, setHires] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showForm, setShowForm] = useState(searchParams.get("new") === "true");
  const [formData, setFormData] = useState({ full_name: "", email: "", role_title: "", department: "", start_date: "", manager_name: "" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const [h, t] = await Promise.all([
        base44.entities.NewHire.list("-created_date", 100),
        base44.entities.OnboardingTask.list("-created_date", 500),
      ]);
      setHires(h);
      setTasks(t);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!formData.full_name || !formData.email || !formData.role_title || !formData.department || !formData.start_date) return;
    setSaving(true);
    try {
      const hire = await base44.entities.NewHire.create({ ...formData, status: "pending" });
      // Create default onboarding tasks
      const defaultTasks = [
        { title: "Complete personal information form", category: "documentation", priority: "high", order: 1 },
        { title: "Sign employment agreement", category: "documentation", priority: "urgent", order: 2 },
        { title: "Set up email and accounts", category: "setup", priority: "high", order: 3 },
        { title: "Complete compliance training", category: "compliance", priority: "high", order: 4 },
        { title: "Read employee handbook", category: "training", priority: "medium", order: 5 },
        { title: "Meet with team lead", category: "meeting", priority: "medium", order: 6 },
        { title: "Tour office / virtual orientation", category: "training", priority: "low", order: 7 },
        { title: "Set up development environment", category: "setup", priority: "medium", order: 8 },
      ];
      await base44.entities.OnboardingTask.bulkCreate(
        defaultTasks.map(t => ({ ...t, new_hire_id: hire.id, status: "pending", due_date: formData.start_date, points: 10 }))
      );
      setFormData({ full_name: "", email: "", role_title: "", department: "", start_date: "", manager_name: "" });
      setShowForm(false);
      setSearchParams({});
      load();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const filtered = hires.filter(h => {
    if (filterStatus !== "all" && h.status !== filterStatus) return false;
    if (search && !h.full_name?.toLowerCase().includes(search.toLowerCase()) && !h.role_title?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getHireProgress = (hireId) => {
    const hireTasks = tasks.filter(t => t.new_hire_id === hireId);
    const done = hireTasks.filter(t => t.status === "completed").length;
    return hireTasks.length > 0 ? Math.round((done / hireTasks.length) * 100) : 0;
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Hires</h1>
          <p className="text-sm text-slate-500 mt-1">{hires.length} total · {hires.filter(h => h.status !== "completed").length} active</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white">
          <Plus className="w-4 h-4 mr-2" /> Add New Hire
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or role..." className="pl-9 bg-white" />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-44 bg-white">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={Users} title="No new hires found" description="Add new hires to get started with onboarding." action={<Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white" size="sm"><Plus className="w-4 h-4 mr-1" /> Add New Hire</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence>
            {filtered.map((h, i) => {
              const pct = getHireProgress(h.id);
              return (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link to={`/checklists?hire=${h.id}`} className="block bg-white rounded-2xl ring-1 ring-slate-100 p-5 hover:ring-mint/30 transition-all group">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lavender-soft to-mint-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-slate-700">{h.full_name?.split(" ").map(n => n[0]).join("").slice(0, 2)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-800 group-hover:text-mint-dark transition-colors truncate">{h.full_name}</h3>
                          <StatusBadge status={h.status} />
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{h.role_title} · {h.department}</p>
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-slate-400">Progress</span>
                            <span className="text-xs font-semibold text-slate-600">{pct}%</span>
                          </div>
                          <ProgressChannel value={pct} color={pct >= 75 ? "mint" : "lavender"} height="h-2" />
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {h.start_date}</span>
                          {h.manager_name && <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {h.manager_name}</span>}
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Form Dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { setShowForm(o); if (!o) setSearchParams({}); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Hire</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} placeholder="Jane Smith" />
              </div>
              <div>
                <Label>Email *</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="jane@company.com" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Role Title *</Label>
                <Input value={formData.role_title} onChange={e => setFormData({ ...formData, role_title: e.target.value })} placeholder="Software Engineer" />
              </div>
              <div>
                <Label>Department *</Label>
                <Select value={formData.department} onValueChange={v => setFormData({ ...formData, department: v })}>
                  <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                  <SelectContent>
                    {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={formData.start_date} onChange={e => setFormData({ ...formData, start_date: e.target.value })} />
              </div>
              <div>
                <Label>Manager Name</Label>
                <Input value={formData.manager_name} onChange={e => setFormData({ ...formData, manager_name: e.target.value })} placeholder="John Doe" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => { setShowForm(false); setSearchParams({}); }}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                {saving ? "Saving..." : "Add New Hire"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}