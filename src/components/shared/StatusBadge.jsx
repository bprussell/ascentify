import React from "react";

const styles = {
  pending: "bg-ochre-cream text-ochre-sand",
  in_progress: "bg-lavender-soft text-lavender-deep",
  completed: "bg-mint-100 text-mint-dark",
  overdue: "bg-coral-50 text-coral-burnt",
  blocked: "bg-coral-50 text-coral-burnt",
  low: "bg-slate-100 text-slate-500",
  medium: "bg-ochre-cream text-ochre-sand",
  high: "bg-lavender-soft text-lavender-deep",
  urgent: "bg-coral-50 text-coral-burnt",
};

const labels = {
  pending: "Pending",
  in_progress: "In Progress",
  completed: "Completed",
  overdue: "Overdue",
  blocked: "Blocked",
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || "bg-slate-100 text-slate-500"}`}>
      {labels[status] || status}
    </span>
  );
}