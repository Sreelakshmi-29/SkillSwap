import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center text-center px-4">
    <div>
      <div className="text-8xl mb-4">404</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Page Not Found</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6">The page you're looking for doesn't exist.</p>
      <Link to="/" className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
        Go Home
      </Link>
    </div>
  </div>
);

export default NotFound;