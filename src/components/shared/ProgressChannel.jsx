import React from "react";
import { motion } from "framer-motion";

export default function ProgressChannel({ value = 0, color = "mint", height = "h-3", delay = 0 }) {
  const fillClass = color === "lavender" ? "progress-fill-lavender" : "progress-fill-mint";

  return (
    <div className={`progress-track w-full ${height}`}>
      <motion.div
        className={`${fillClass} ${height}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(value, 100)}%` }}
        transition={{ duration: 0.6, delay, ease: [0.34, 1.56, 0.64, 1] }}
      />
    </div>
  );
}