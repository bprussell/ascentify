import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, User, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "@/components/shared/EmptyState";

const TYPE_COLORS = {
  orientation: "bg-mint-50 text-mint-dark border-mint/20",
  technical: "bg-lavender-50 text-lavender-deep border-lavender/20",
  compliance: "bg-coral-50 text-coral-burnt border-coral/20",
  culture: "bg-ochre-50 text-ochre-sand border-ochre/20",
  team_meeting: "bg-slate-50 text-slate-600 border-slate-200",
};

export default function Training() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "", time: "", duration_minutes: 60, facilitator: "", location: "", department: "", type: "orientation" });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const s = await base44.entities.TrainingSession.list("-date", 100);
      setSessions(s);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    await base44.entities.TrainingSession.create(form);
    setForm({ title: "", description: "", date: "", time: "", duration_minutes: 60, facilitator: "", location: "", department: "", type: "orientation" });
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.TrainingSession.delete(id);
    load();
  };

  // Group by date
  const grouped = sessions.reduce((acc, s) => {
    const d = s.date || "Unscheduled";
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Training Sessions</h1>
          <p className="text-sm text-slate-500 mt-1">{sessions.length} sessions scheduled</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white">
          <Plus className="w-4 h-4 mr-2" /> Schedule Session
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState icon={Calendar} title="No training sessions" description="Schedule training sessions and welcome meetings for new hires." action={<Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white" size="sm"><Plus className="w-4 h-4 mr-1" /> Schedule Session</Button>} />
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).map(([date, items]) => (
            <div key={date}>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                {date === "Unscheduled" ? date : new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
              </h2>
              <div className="space-y-3">
                {items.map((s, i) => (
                  <motion.div
                    key={s.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${TYPE_COLORS[s.type] || TYPE_COLORS.orientation}`}>
                            {(s.type || "orientation").replace("_", " ")}
                          </span>
                          {s.department && <span className="text-xs text-slate-400">{s.department}</span>}
                        </div>
                        <h3 className="text-base font-semibold text-slate-800">{s.title}</h3>
                        {s.description && <p className="text-sm text-slate-500 mt-1">{s.description}</p>}
                        <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                          {s.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.time}</span>}
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {s.duration_minutes || 60} min</span>
                          {s.facilitator && <span className="flex items-center gap-1"><User className="w-3 h-3" /> {s.facilitator}</span>}
                          {s.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {s.location}</span>}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-coral">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>Schedule Training Session</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Orientation Day 1" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="What will be covered..." rows={2} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Date *</Label>
                <Input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
              </div>
              <div>
                <Label>Time</Label>
                <Input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={form.duration_minutes} onChange={e => setForm({ ...form, duration_minutes: parseInt(e.target.value) || 60 })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Type</Label>
                <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["orientation", "technical", "compliance", "culture", "team_meeting"].map(t => <SelectItem key={t} value={t}>{t.replace("_", " ")}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Facilitator</Label>
                <Input value={form.facilitator} onChange={e => setForm({ ...form, facilitator: e.target.value })} placeholder="Name" />
              </div>
            </div>
            <div>
              <Label>Location</Label>
              <Input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} placeholder="Room 204 / Zoom link" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                {saving ? "Saving..." : "Schedule"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}