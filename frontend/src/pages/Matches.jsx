import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchApi } from '../api/matchApi';
import { useAuth } from '../context/AuthContext';

const Matches = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('mine');
  const [myMatches, setMyMatches] = useState([]);
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [myRes, potentialRes] = await Promise.all([
          matchApi.getMyMatches(),
          matchApi.getPotentialMatches(),
        ]);
        setMyMatches(myRes.data.data.matches || []);
        setPotentialMatches(potentialRes.data.data.matches || []);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleConnect = async (targetUserId) => {
    try {
      const res = await matchApi.createMatch(targetUserId);
      const newMatch = res.data.data.match;
      setMyMatches(prev => [newMatch, ...prev]);
      setPotentialMatches(prev => prev.filter(u => u._id !== targetUserId));
      alert('🎉 Match created! You can now chat.');
    } catch (err) {
      console.error('Match creation failed:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );

  const getOtherUser = (match) =>
    match.user1?._id === user?._id ? match.user2 : match.user1;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Skill Matches</h1>

      <div className="flex gap-2 mb-6">
        {[['mine', `My Matches (${myMatches.length})`], ['potential', `Discover (${potentialMatches.length})`]].map(([tab, label]) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === tab
                ? 'bg-sky-500 text-white'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'mine' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myMatches.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-3">🤝</div>
              <p>No matches yet. Check the Discover tab!</p>
            </div>
          ) : (
            myMatches.map(match => {
              const other = getOtherUser(match);
              return (
                <div key={match._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                  <div className="flex items-center gap-3 mb-3">
                    <img src={other?.avatar || `https://ui-avatars.com/api/?name=${other?.name}&background=0ea5e9&color=fff`} className="w-12 h-12 rounded-full" />
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">{other?.name}</div>
                      <div className="text-sm text-yellow-500">⭐ {other?.rating?.toFixed(1) || 'New'}</div>
                    </div>
                  </div>
                  <Link to={`/chat/${match._id}`} className="block text-center py-2 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-lg text-sm hover:bg-sky-100 transition-colors">
                    💬 Open Chat
                  </Link>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'potential' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {potentialMatches.length === 0 ? (
            <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p>No potential matches found.</p>
              <p className="text-sm mt-1">Add more skills to find matches!</p>
            </div>
          ) : (
            potentialMatches.map(potentialUser => (
              <div key={potentialUser._id} className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-3 mb-3">
                  <img src={potentialUser.avatar || `https://ui-avatars.com/api/?name=${potentialUser.name}&background=8b5cf6&color=fff`} className="w-12 h-12 rounded-full" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{potentialUser.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{potentialUser.location}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {potentialUser.offeredSkills?.slice(0, 3).map(skill => (
                    <span key={skill._id} className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                      🎓 {skill.name}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => handleConnect(potentialUser._id)}
                  className="w-full py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
                >
                  Connect & Exchange 🤝
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Matches;