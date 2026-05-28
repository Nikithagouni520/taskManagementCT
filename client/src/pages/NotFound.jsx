import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-9xl font-bold text-gray-200 dark:text-gray-800">404</h1>
        <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">Page not found</h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Go back home
        </Link>
      </motion.div>
    </div>
  );
}
