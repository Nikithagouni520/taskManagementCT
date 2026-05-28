import { motion } from 'framer-motion';

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <motion.div
        className="flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 animate-pulse" />
          <motion.div
            className="absolute inset-0 rounded-2xl border-2 border-primary-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0, 1],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Loading...</p>
      </motion.div>
    </div>
  );
}
