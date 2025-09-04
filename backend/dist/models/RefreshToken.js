import mongoose, { Schema } from 'mongoose';
const RefreshTokenSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    token: { type: String, required: true, index: true, unique: true },
    expiresAt: { type: Date, required: true, index: true },
    revoked: { type: Boolean, default: false, index: true }
}, { timestamps: true });
export const RefreshToken = mongoose.models.RefreshToken || mongoose.model('RefreshToken', RefreshTokenSchema);
