const Skill = require('../models/Skill');
const User = require('../models/User');
const { sendSuccess } = require('../utils/apiResponse');

const skillController = {

  addSkill: async (req, res) => {
    const { name, category, level, type, description } = req.body;
    
    const skill = await Skill.create({
      user: req.user._id,
      name,
      category,
      level,
      type,
      description,
    });
    
    const updateField = type === 'offer' ? 'offeredSkills' : 'wantedSkills';
    await User.findByIdAndUpdate(req.user._id, {
      $push: { [updateField]: skill._id }
    });
    
    sendSuccess(res, { skill }, 'Skill added successfully', 201);
  },

  getMySkills: async (req, res) => {
    const skills = await Skill.find({ 
      user: req.user._id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    sendSuccess(res, { skills });
  },

  getUserSkills: async (req, res) => {
    const skills = await Skill.find({ 
      user: req.params.userId, 
      isActive: true 
    });
    
    sendSuccess(res, { skills });
  },

  updateSkill: async (req, res) => {
    const skill = await Skill.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!skill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Skill not found or unauthorized' 
      });
    }
    
    const { name, category, level, description } = req.body;
    Object.assign(skill, { name, category, level, description });
    await skill.save();
    
    sendSuccess(res, { skill }, 'Skill updated successfully');
  },

  deleteSkill: async (req, res) => {
    const skill = await Skill.findOne({ 
      _id: req.params.id, 
      user: req.user._id 
    });
    
    if (!skill) {
      return res.status(404).json({ 
        success: false, 
        message: 'Skill not found or unauthorized' 
      });
    }
    
    skill.isActive = false;
    await skill.save();
    
    const updateField = skill.type === 'offer' ? 'offeredSkills' : 'wantedSkills';
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { [updateField]: skill._id }
    });
    
    sendSuccess(res, null, 'Skill removed successfully');
  },
};

module.exports = skillController;