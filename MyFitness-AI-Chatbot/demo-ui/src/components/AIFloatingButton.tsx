import { motion } from "framer-motion";

interface AIFloatingButtonProps {
  onClick: () => void;
}

export const AIFloatingButton = ({ onClick }: AIFloatingButtonProps) => {
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 4px 12px rgba(0,0,0,0.3)",
            "0 8px 24px rgba(0,0,0,0.4)",
            "0 4px 12px rgba(0,0,0,0.3)",
          ],
        }}
        transition={{
          boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" },
        }}
        className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-3xl shadow-xl transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer"
        aria-label="Open AI Coach"
        type="button"
      >
        🤖
      </motion.button>
    </div>
  );
};