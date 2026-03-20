const BADGES = [
  {
    name: 'Premier pas',
    description: 'Rejoindre sa première activité',
    icon: '🏃',
    condition: (stats) => stats.activitiesCompleted >= 1,
  },
  {
    name: 'Régulier',
    description: 'Participer à 5 activités',
    icon: '⭐',
    condition: (stats) => stats.activitiesCompleted >= 5,
  },
  {
    name: 'Athlète',
    description: 'Participer à 10 activités',
    icon: '🏆',
    condition: (stats) => stats.activitiesCompleted >= 10,
  },
  {
    name: 'Matinal',
    description: '3 jours consécutifs actifs',
    icon: '🌅',
    condition: (stats) => stats.consecutiveDays >= 3,
  },
  {
    name: 'Endurant',
    description: 'Cumuler 10 heures d\'activité',
    icon: '💪',
    condition: (stats) => stats.totalHours >= 10,
  },
]

const checkAndUnlockBadges = async (user) => {
  const newBadges = []

  for (const badge of BADGES) {
    const alreadyHas = user.badges.some(b => b.name === badge.name)
    if (!alreadyHas && badge.condition(user.stats)) {
      newBadges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
      })
    }
  }

  if (newBadges.length > 0) {
    user.badges.push(...newBadges)
    await user.save()
  }

  return newBadges
}

module.exports = { checkAndUnlockBadges, BADGES }