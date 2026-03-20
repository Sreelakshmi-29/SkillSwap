import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { reviewApi } from '../api/reviewApi';

const Profile = () => {
  const { id } = useParams();
  const { user, setUser } = useAuth();
  const isOwnProfile = !id || id === user?._id;

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', location: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileId = id || user?._id;
        const [profileRes, reviewRes] = await Promise.all([
          userApi.getUserById(profileId),
          reviewApi.getUserReviews(profileId),
        ]);
        const profileData = profileRes.data.data.user;
        setProfile(profileData);
        setReviews(reviewRes.data.data.reviews || []);
        setEditForm({ name: profileData.name, bio: profileData.bio || '', location: profileData.location || '' });
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [id, user]);

  const handleSaveProfile = async () => {
    try {
      const res = await userApi.updateProfile(editForm);
      const updated = res.data.data.user;
      setProfile(updated);
      if (isOwnProfile) setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update failed:', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );

  if (!profile) return <div className="text-center py-12">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 mb-6">
        <div className="flex items-start gap-4">
          <img
            src={profile.avatar || `https://ui-avatars.com/api/?name=${profile.name}&size=100&background=0ea5e9&color=fff`}
            alt={profile.name}
            className="w-20 h-20 rounded-2xl"
          />
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-2">
                <input
                  value={editForm.name}
                  onChange={e => setEditForm({...editForm, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
                <textarea
                  value={editForm.bio}
                  onChange={e => setEditForm({...editForm, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none resize-none"
                />
                <input
                  value={editForm.location}
                  onChange={e => setEditForm({...editForm, location: e.target.value})}
                  placeholder="City, Country"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-sm hover:bg-sky-600">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-lg text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{profile.name}</h1>
                {profile.location && <p className="text-gray-500 dark:text-gray-400 text-sm">📍 {profile.location}</p>}
                {profile.bio && <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">{profile.bio}</p>}
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-yellow-500">⭐ {profile.rating?.toFixed(1) || 'New'}</span>
                  <span className="text-gray-400 text-sm">({profile.reviewCount || 0} reviews)</span>
                </div>
                {isOwnProfile && (
                  <button onClick={() => setIsEditing(true)} className="mt-2 text-sm text-sky-500 hover:text-sky-600">
                    Edit Profile ✏️
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">🎓 Can Teach</h3>
          <div className="space-y-1">
            {profile.offeredSkills?.map(skill => (
              <div key={skill._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span className="text-xs text-gray-400">{skill.level}</span>
              </div>
            ))}
            {!profile.offeredSkills?.length && <p className="text-sm text-gray-400">No skills added</p>}
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📚 Wants to Learn</h3>
          <div className="space-y-1">
            {profile.wantedSkills?.map(skill => (
              <div key={skill._id} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700 dark:text-gray-300">{skill.name}</span>
                <span className="text-xs text-gray-400">{skill.level}</span>
              </div>
            ))}
            {!profile.wantedSkills?.length && <p className="text-sm text-gray-400">No learning goals added</p>}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-100 dark:border-slate-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Reviews ({reviews.length})</h3>
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-400">No reviews yet.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map(review => (
              <div key={review._id} className="border-t border-gray-100 dark:border-slate-700 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <img src={review.reviewer.avatar || `https://ui-avatars.com/api/?name=${review.reviewer.name}&background=0ea5e9&color=fff`} className="w-7 h-7 rounded-full" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer.name}</span>
                  <span className="text-yellow-500 text-sm">{'⭐'.repeat(review.rating)}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;