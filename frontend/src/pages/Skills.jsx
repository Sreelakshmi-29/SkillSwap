import { useState, useEffect } from 'react';
import { skillApi } from '../api/skillApi';

const CATEGORIES = ['Technology', 'Music', 'Art & Design', 'Language', 'Sports & Fitness', 'Cooking', 'Business', 'Academic', 'Crafts', 'Other'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const SkillForm = ({ onAdd, onClose }) => {
  const [form, setForm] = useState({
    name: '', category: 'Technology', level: 'Intermediate',
    type: 'offer', description: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      await onAdd(form);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Add New Skill</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Skill Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              placeholder="e.g., Python, Guitar, Spanish..."
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-sky-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Type</label>
              <select
                value={form.type}
                onChange={e => setForm({...form, type: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none"
              >
                <option value="offer">I Can Teach</option>
                <option value="want">I Want to Learn</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-400">Level</label>
              <select
                value={form.level}
                onChange={e => setForm({...form, level: e.target.value})}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none"
              >
                {LEVELS.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Category</label>
            <select
              value={form.category}
              onChange={e => setForm({...form, category: e.target.value})}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none"
            >
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600 dark:text-gray-400">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
              placeholder="Tell others more about this skill..."
              rows={3}
              className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading || !form.name.trim()} className="flex-1 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 disabled:opacity-50">
            {loading ? 'Adding...' : 'Add Skill'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await skillApi.getMySkills();
        setSkills(res.data.data.skills || []);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  const handleAddSkill = async (formData) => {
    const res = await skillApi.addSkill(formData);
    setSkills(prev => [...prev, res.data.data.skill]);
  };

  const handleDeleteSkill = async (skillId) => {
    await skillApi.deleteSkill(skillId);
    setSkills(prev => prev.filter(s => s._id !== skillId));
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-8 h-8 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin"></div>
    </div>
  );

  const offeredSkills = skills.filter(s => s.type === 'offer');
  const wantedSkills = skills.filter(s => s.type === 'want');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Skills</h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-colors"
        >
          + Add Skill
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            🎓 I Can Teach ({offeredSkills.length})
          </h2>
          <div className="space-y-2">
            {offeredSkills.map(skill => (
              <div key={skill._id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{skill.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{skill.category} • {skill.level}</div>
                </div>
                <button onClick={() => handleDeleteSkill(skill._id)} className="text-red-400 hover:text-red-500 p-1 text-lg">✕</button>
              </div>
            ))}
            {offeredSkills.length === 0 && (
              <p className="text-gray-400 text-sm p-3">No teaching skills yet. Add some!</p>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            📚 I Want to Learn ({wantedSkills.length})
          </h2>
          <div className="space-y-2">
            {wantedSkills.map(skill => (
              <div key={skill._id} className="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-100 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">{skill.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{skill.category} • {skill.level}</div>
                </div>
                <button onClick={() => handleDeleteSkill(skill._id)} className="text-red-400 hover:text-red-500 p-1 text-lg">✕</button>
              </div>
            ))}
            {wantedSkills.length === 0 && (
              <p className="text-gray-400 text-sm p-3">No learning goals yet. Add some!</p>
            )}
          </div>
        </div>
      </div>

      {skills.length < 2 && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-400">
          💡 <strong>Tip:</strong> Add at least one skill you can teach AND one you want to learn to get matched!
        </div>
      )}

      {showForm && (
        <SkillForm onAdd={handleAddSkill} onClose={() => setShowForm(false)} />
      )}
    </div>
  );
};

export default Skills;