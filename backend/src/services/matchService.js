const User = require('../models/User');
const Match = require('../models/Match');
const Skill = require('../models/Skill');

const matchService = {

  findPotentialMatches: async (userId) => {
    const currentUser = await User.findById(userId)
      .populate('offeredSkills')
      .populate('wantedSkills');

    if (!currentUser) throw new Error('User not found');

    const offeredSkillNames = currentUser.offeredSkills
      .filter(s => s.isActive)
      .map(s => s.name.toLowerCase());
    
    const wantedSkillNames = currentUser.wantedSkills
      .filter(s => s.isActive)
      .map(s => s.name.toLowerCase());

    if (offeredSkillNames.length === 0 || wantedSkillNames.length === 0) {
      return [];
    }

    const existingMatches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }]
    });
    
    const alreadyMatchedUserIds = existingMatches.map(m => 
      m.user1.toString() === userId.toString() ? m.user2.toString() : m.user1.toString()
    );

    const matchingOfferedSkills = await Skill.find({
      name: { $in: offeredSkillNames.map(n => new RegExp(`^${n}$`, 'i')) },
      type: 'want',
      isActive: true,
      user: { $ne: userId },
    });

    const matchingWantedSkills = await Skill.find({
      name: { $in: wantedSkillNames.map(n => new RegExp(`^${n}$`, 'i')) },
      type: 'offer',
      isActive: true,
      user: { $ne: userId },
    });

    const usersWhoWantWhatWeOffer = matchingOfferedSkills.map(s => s.user.toString());
    const usersWhoOfferWhatWeWant = matchingWantedSkills.map(s => s.user.toString());

    const mutualMatchUserIds = usersWhoWantWhatWeOffer.filter(id => 
      usersWhoOfferWhatWeWant.includes(id)
    );

    const newMatchUserIds = mutualMatchUserIds.filter(id => 
      id !== userId.toString() && 
      !alreadyMatchedUserIds.includes(id)
    );

    const uniqueMatchUserIds = [...new Set(newMatchUserIds)];

    const potentialMatches = await User.find({
      _id: { $in: uniqueMatchUserIds },
      isActive: true,
    })
    .populate('offeredSkills')
    .populate('wantedSkills')
    .select('-refreshToken');

    return potentialMatches;
  },

  createMatch: async (user1Id, user2Id) => {
    const existing = await Match.findOne({
      $or: [
        { user1: user1Id, user2: user2Id },
        { user1: user2Id, user2: user1Id },
      ]
    });

    if (existing) return { match: existing, isNew: false };

    const match = await Match.create({
      user1: user1Id,
      user2: user2Id,
    });

    return { match, isNew: true };
  },
};

module.exports = matchService;