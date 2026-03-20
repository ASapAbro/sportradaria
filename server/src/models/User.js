const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est requis'],
      unique: true,
      trim: true,
      minlength: [3, 'Minimum 3 caractères'],
    },
    email: {
      type: String,
      required: [true, 'L\'email est requis'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est requis'],
      minlength: [6, 'Minimum 6 caractères'],
    },
    avatar: {
      type: String,
      default: '',
    },
    sports: {
      type: [String],
      default: [],
    },
    level: {
      type: String,
      enum: ['débutant', 'intermédiaire', 'avancé'],
      default: 'débutant',
    },
    objectives: {
      type: String,
      default: '',
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Activity',
      },
    ],
    badges: [
      {
        name: String,
        description: String,
        icon: String,
        unlockedAt: { type: Date, default: Date.now },
      },
    ],
    stats: {
      activitiesCompleted: { type: Number, default: 0 },
      consecutiveDays: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
    },
    plan: {
        type: String,
        enum: ['gratuit', 'premium', 'entreprise'],
        default: 'gratuit',
    },
    stripeCustomerId: {
        type: String,
        default: '',
    },
    company: {
      name: { type: String, default: '' },
      size: { type: Number, default: 0 },
      employees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
  },
  { timestamps: true }
)

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function () {
  const obj = this.toObject()
  delete obj.password
  return obj
}

module.exports = mongoose.model('User', userSchema)