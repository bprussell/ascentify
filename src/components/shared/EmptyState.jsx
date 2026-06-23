import React from "react";
import { motion } from "framer-motion";

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-300" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
      <p className="text-sm text-slate-400 mt-1 text-center max-w-sm">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}