import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import { MessageSquare, Plus, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "@/components/shared/EmptyState";

const CAT_LABELS = {
  onboarding_process: "Onboarding Process",
  training_quality: "Training Quality",
  manager_support: "Manager Support",
  tools_access: "Tools & Access",
  culture_fit: "Culture Fit",
  general: "General",
};

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState([]);
  const [hires, setHires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ new_hire_id: "", rating: 5, category: "general", comment: "", week_number: 1 });
  const [saving, setSaving] = useState(false);
  const [filterCat, setFilterCat] = useState("all");

  const load = async () => {
    try {
      const [f, h] = await Promise.all([
        base44.entities.Feedback.list("-created_date", 100),
        base44.entities.NewHire.list("-created_date", 100),
      ]);
      setFeedback(f);
      setHires(h);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.new_hire_id) return;
    setSaving(true);
    const hire = hires.find(h => h.id === form.new_hire_id);
    await base44.entities.Feedback.create({
      ...form,
      new_hire_name: hire?.full_name || "",
    });
    // Update hire satisfaction
    const hireFeedback = [...feedback.filter(f => f.new_hire_id === form.new_hire_id), { rating: form.rating }];
    const avgScore = Number((hireFeedback.reduce((s, f) => s + (f.rating || 0), 0) / hireFeedback.length).toFixed(1));
    await base44.entities.NewHire.update(form.new_hire_id, { satisfaction_score: avgScore });
    setForm({ new_hire_id: "", rating: 5, category: "general", comment: "", week_number: 1 });
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Feedback.delete(id);
    load();
  };

  const filtered = filterCat === "all" ? feedback : feedback.filter(f => f.category === filterCat);

  // Summary
  const avgRating = feedback.length > 0
    ? (feedback.reduce((s, f) => s + (f.rating || 0), 0) / feedback.length).toFixed(1)
    : "—";
  const ratingDist = [5, 4, 3, 2, 1].map(r => ({
    rating: r,
    count: feedback.filter(f => f.rating === r).length,
    pct: feedback.length > 0 ? Math.round((feedback.filter(f => f.rating === r).length / feedback.length) * 100) : 0,
  }));

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Feedback</h1>
          <p className="text-sm text-slate-500 mt-1">{feedback.length} responses collected</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white">
          <Plus className="w-4 h-4 mr-2" /> Submit Feedback
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl ring-1 ring-slate-100 p-6">
          <p className="text-sm text-slate-500 mb-2">Average Rating</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-extrabold text-mint-dark">{avgRating}</span>
            <span className="text-lg text-slate-400">/5</span>
          </div>
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map(s => (
              <Star key={s} className={`w-5 h-5 ${s <= Math.round(parseFloat(avgRating) || 0) ? "fill-mint text-mint" : "text-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl ring-1 ring-slate-100 p-6">
          <p className="text-sm text-slate-500 mb-3">Rating Distribution</p>
          <div className="space-y-2">
            {ratingDist.map(r => (
              <div key={r.rating} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-600 w-3">{r.rating}</span>
                <Star className="w-3.5 h-3.5 fill-mint text-mint" />
                <div className="flex-1 progress-track h-2">
                  <div className="progress-fill-mint h-2 transition-all duration-500" style={{ width: `${r.pct}%` }} />
                </div>
                <span className="text-xs text-slate-500 w-8 text-right">{r.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-52 bg-white"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {Object.entries(CAT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyState icon={MessageSquare} title="No feedback yet" description="Collect feedback from new hires about their onboarding experience." action={<Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white" size="sm"><Plus className="w-4 h-4 mr-1" /> Submit Feedback</Button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= (f.rating || 0) ? "fill-mint text-mint" : "text-slate-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">
                      {CAT_LABELS[f.category] || "General"}
                    </span>
                    {f.week_number && <span className="text-xs text-slate-400">Week {f.week_number}</span>}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{f.new_hire_name || "Anonymous"}</p>
                  {f.comment && <p className="text-sm text-slate-500 mt-1">{f.comment}</p>}
                  <p className="text-xs text-slate-400 mt-2">{new Date(f.created_date).toLocaleDateString()}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-coral">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Submit Form */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit Feedback</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>New Hire *</Label>
              <Select value={form.new_hire_id} onValueChange={v => setForm({ ...form, new_hire_id: v })}>
                <SelectTrigger><SelectValue placeholder="Select employee..." /></SelectTrigger>
                <SelectContent>
                  {hires.map(h => <SelectItem key={h.id} value={h.id}>{h.full_name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Rating</Label>
              <div className="flex gap-2 mt-1">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setForm({ ...form, rating: s })} className="focus:outline-none">
                    <Star className={`w-8 h-8 transition-colors ${s <= form.rating ? "fill-mint text-mint" : "text-slate-200 hover:text-slate-300"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CAT_LABELS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Week Number</Label>
                <Input type="number" value={form.week_number} onChange={e => setForm({ ...form, week_number: parseInt(e.target.value) || 1 })} min={1} max={12} />
              </div>
            </div>
            <div>
              <Label>Comment</Label>
              <Textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Share your experience..." rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                {saving ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}