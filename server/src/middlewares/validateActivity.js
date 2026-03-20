const validateActivity = (req, res, next) => {
  const { title, sport, location, date, maxParticipants, price } = req.body

  const errors = []

  if (!title || title.trim().length < 3) {
    errors.push('Le titre doit faire au moins 3 caractères')
  }

  const validSports = [
    'football', 
    'basketball', 
    'tennis', 
    'yoga', 
    'running', 
    'cycling', 
    'swimming', 
    'rugby', 
    'volleyball', 
    'hiking', 
    'autre'
  ]

  if (!sport || !validSports.includes(sport)) {
    errors.push('Sport invalide')
  }

  if (!location?.address || !location?.city || !location?.coordinates?.lat || !location?.coordinates?.lon) {
    errors.push('Localisation incomplète')
  }

  if (!date || new Date(date) < new Date()) {
    errors.push('La date doit être dans le futur')
  }

  if (maxParticipants && (maxParticipants < 2 || maxParticipants > 100)) {
    errors.push('Le nombre de participants doit être entre 2 et 100')
  }

  if (price && (price < 0 || price > 1000)) {
    errors.push('Le prix doit être entre 0 et 1000€')
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Données invalides', errors })
  }

  next()
}

module.exports = validateActivity
