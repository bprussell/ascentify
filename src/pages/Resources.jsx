import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";
import {
  BookOpen, Search, Plus, FileText, Video, HelpCircle,
  File, ExternalLink, Trash2, Upload
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import EmptyState from "@/components/shared/EmptyState";

const CAT_ICONS = {
  policy: FileText,
  training: BookOpen,
  guide: File,
  video: Video,
  template: FileText,
  faq: HelpCircle,
};

const CAT_COLORS = {
  policy: "bg-coral-50 text-coral-burnt",
  training: "bg-mint-50 text-mint-dark",
  guide: "bg-lavender-50 text-lavender-deep",
  video: "bg-ochre-50 text-ochre-sand",
  template: "bg-slate-50 text-slate-600",
  faq: "bg-mint-50 text-mint-dark",
};

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "guide", department: "", link_url: "", tags: "" });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await base44.entities.Resource.list("-created_date", 100);
      setResources(r);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    let file_url = "";
    if (file) {
      const res = await base44.integrations.Core.UploadFile({ file });
      file_url = res.file_url;
    }
    await base44.entities.Resource.create({ ...form, file_url });
    setForm({ title: "", description: "", category: "guide", department: "", link_url: "", tags: "" });
    setFile(null);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    await base44.entities.Resource.delete(id);
    load();
  };

  const filtered = resources.filter(r => {
    if (filterCat !== "all" && r.category !== filterCat) return false;
    if (search) {
      const q = search.toLowerCase();
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q) || r.tags?.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="w-8 h-8 border-4 border-mint-100 border-t-mint rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Resource Library</h1>
          <p className="text-sm text-slate-500 mt-1">{resources.length} resources available</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Resource
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resources..." className="pl-9 bg-white" />
        </div>
        <Select value={filterCat} onValueChange={setFilterCat}>
          <SelectTrigger className="w-44 bg-white"><SelectValue placeholder="All categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {["policy", "training", "guide", "video", "template", "faq"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No resources found" description="Upload training materials, policies, and guides for new hires." action={<Button onClick={() => setShowForm(true)} className="bg-mint hover:bg-mint-dark text-white" size="sm"><Plus className="w-4 h-4 mr-1" /> Add Resource</Button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r, i) => {
            const CatIcon = CAT_ICONS[r.category] || File;
            return (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-white rounded-2xl ring-1 ring-slate-100 p-5 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${CAT_COLORS[r.category] || "bg-slate-50 text-slate-500"}`}>
                    <CatIcon className="w-5 h-5" />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-coral">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-sm font-semibold text-slate-800 mb-1">{r.title}</h3>
                {r.description && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{r.description}</p>}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CAT_COLORS[r.category] || "bg-slate-50 text-slate-500"}`}>
                    {r.category}
                  </span>
                  {r.department && <span className="text-xs text-slate-400">{r.department}</span>}
                </div>
                {(r.file_url || r.link_url) && (
                  <a href={r.file_url || r.link_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-xs text-mint-dark hover:underline">
                    <ExternalLink className="w-3 h-3" /> Open resource
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Resource</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Employee Handbook" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="Brief description..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["policy", "training", "guide", "video", "template", "faq"].map(c => <SelectItem key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Department</Label>
                <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="All" />
              </div>
            </div>
            <div>
              <Label>Link URL</Label>
              <Input value={form.link_url} onChange={e => setForm({ ...form, link_url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Upload File</Label>
              <Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="cursor-pointer" />
            </div>
            <div>
              <Label>Tags</Label>
              <Input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="onboarding, policy, hr" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-mint hover:bg-mint-dark text-white">
                {saving ? "Uploading..." : "Add Resource"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}