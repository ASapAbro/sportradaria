const { verifyAccessToken } = require('../utils/jwt')
const User = require('../models/User')

const authGuard = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token manquant' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.id)
    if (!user) {
      return res.status(401).json({ message: 'Utilisateur introuvable' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide ou expiré' })
  }
}

module.exports = authGuard