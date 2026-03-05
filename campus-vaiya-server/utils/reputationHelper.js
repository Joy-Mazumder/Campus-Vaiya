export const updateReputation = async (userId, type) => {
  const pointsMap = {
    'RESOURCE_UPVOTE': 4,
    'RESOURCE_DOWNVOTE': -2.4,
    'HELP_SOLVED': 20,
    'HELP_ANSWER_UPVOTE': 8,
    'HELP_ANSWER_DOWNVOTE': -4.4,
    'RESOURCE_POST': 2
  };
  
  const points = pointsMap[type] || 0;
  await User.findByIdAndUpdate(userId, { $inc: { reputationPoints: points } });
};