import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { matchApi } from '../api/matchApi';

const Dashboard = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matchRes = await matchApi.getMyMatches();
        setMatches(matchRes.data.data.matches || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Here's what's happening with your skill exchanges.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Matches', value: matches.length, color: 'text-blue-500' },
          { label: 'Skills Offered', value: user?.offeredSkills?.length || 0, color: 'text-green-500' },
          { label: 'Skills Wanted', value: user?.wantedSkills?.length || 0, color: 'text-purple-500' },
          { label: 'Rating', value: user?.rating ? `${user.rating}⭐` : 'New', color: 'text-yellow-500' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-slate-700">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link to="/skills" className="flex items-center gap-3 p-4 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
          <span className="text-2xl">🎯</span>
          <div>
            <div className="font-semibold">Manage Skills</div>
            <div className="text-sm opacity-80">Add or update your skills</div>
          </div>
        </Link>
        <Link to="/matches" className="flex items-center gap-3 p-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors">
          <span className="text-2xl">🤝</span>
          <div>
            <div className="font-semibold">Find Matches</div>
            <div className="text-sm opacity-80">Discover skill exchange partners</div>
          </div>
        </Link>
        <Link to="/profile" className="flex items-center gap-3 p-4 bg-gray-700 text-white rounded-xl hover:bg-gray-800 transition-colors">
          <span className="text-2xl">👤</span>
          <div>
            <div className="font-semibold">Edit Profile</div>
            <div className="text-sm opacity-80">Update your information</div>
          </div>
        </Link>
      </div>

      {matches.length === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No matches yet</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Add your skills first, then find people to exchange with!</p>
          <Link to="/skills" className="px-6 py-3 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors">
            Add Your Skills
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;