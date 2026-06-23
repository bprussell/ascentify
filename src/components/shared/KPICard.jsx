import React from "react";
import { motion } from "framer-motion";

const colorMap = {
  mint: { bg: "bg-mint-50", text: "text-mint-dark", ring: "ring-mint/20" },
  lavender: { bg: "bg-lavender-50", text: "text-lavender-deep", ring: "ring-lavender/20" },
  coral: { bg: "bg-coral-50", text: "text-coral-burnt", ring: "ring-coral/20" },
  ochre: { bg: "bg-ochre-50", text: "text-ochre-sand", ring: "ring-ochre/20" },
};

export default function KPICard({ icon: Icon, label, value, subtitle, color = "mint", delay = 0 }) {
  const c = colorMap[color] || colorMap.mint;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white rounded-2xl p-6 ring-1 ring-slate-100"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className={`text-4xl font-extrabold tracking-tight mt-1 ${c.text}`}>{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl ${c.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${c.text}`} />
        </div>
      </div>
    </motion.div>
  );
}