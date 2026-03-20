import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import axios from '../api/axios'

export default function CommentSection({ activityId }) {
  const { user, accessToken } = useAuth()
  const [comments, setComments] = useState([])
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get(`/comments/${activityId}`)
      .then(({ data }) => setComments(data.comments))
      .finally(() => setLoading(false))
  }, [activityId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    try {
      const { data } = await axios.post(`/comments/${activityId}`,
        { content },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setComments(prev => [data.comment, ...prev])
      setContent('')
    } catch (error) {
      console.error(error)
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await axios.delete(`/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      setComments(prev => prev.filter(c => c._id !== commentId))
    } catch (error) {
      console.error(error)
    }
  }

  const handleLike = async (commentId) => {
    try {
      const { data } = await axios.post(`/comments/${commentId}/like`, {},
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setComments(prev => prev.map(c =>
        c._id === commentId
          ? { ...c, likes: Array(data.likes).fill(null) }
          : c
      ))
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium text-gray-700 mb-4">
        Commentaires ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
        <input
          type="text"
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
        />
        <button
          type="submit"
          disabled={!content.trim()}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Envoyer
        </button>
      </form>

      {loading ? (
        <p className="text-gray-400 text-sm">Chargement...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-400 text-sm">Aucun commentaire pour l'instant.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map(comment => (
            <div key={comment._id} className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                    {comment.author?.username?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {comment.author?.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleLike(comment._id)}
                    className="text-xs text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    ♥ {comment.likes?.length || 0}
                  </button>
                  {user?._id === comment.author?._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}