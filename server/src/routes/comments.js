const express = require('express')
const router = express.Router()
const Comment = require('../models/Comment')
const authGuard = require('../middlewares/authGuard')

// GET /api/comments/:activityId — commentaires d'une activité
router.get('/:activityId', async (req, res) => {
  try {
    const comments = await Comment.find({ activity: req.params.activityId })
      .populate('author', 'username avatar')
      .sort({ createdAt: -1 })
    res.json({ comments })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/comments/:activityId — ajouter un commentaire
router.post('/:activityId', authGuard, async (req, res) => {
  try {
    const comment = await Comment.create({
      activity: req.params.activityId,
      author: req.user._id,
      content: req.body.content,
    })

    await comment.populate('author', 'username avatar')

    const io = req.app.get('io')
    io.emit('new_comment', {
      activityId: req.params.activityId,
      comment,
    })

    res.status(201).json({ comment })
  } catch (error) {
    res.status(400).json({ message: error.message })
  }
})

// DELETE /api/comments/:id — supprimer son commentaire
router.delete('/:id', authGuard, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' })
    if (comment.author.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Non autorisé' })
    await comment.deleteOne()
    res.json({ message: 'Commentaire supprimé' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// POST /api/comments/:id/like — liker un commentaire
router.post('/:id/like', authGuard, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' })

    const liked = comment.likes.includes(req.user._id)
    if (liked) {
      comment.likes = comment.likes.filter(l => l.toString() !== req.user._id.toString())
    } else {
      comment.likes.push(req.user._id)
    }
    await comment.save()
    res.json({ likes: comment.likes.length, liked: !liked })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

module.exports = router