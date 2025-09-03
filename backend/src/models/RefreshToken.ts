import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IRefreshToken extends Document {
	user: Types.ObjectId;
	token: string;
	expiresAt: Date;
	revoked: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>(
	{
		user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
		token: { type: String, required: true, index: true, unique: true },
		expiresAt: { type: Date, required: true, index: true },
		revoked: { type: Boolean, default: false, index: true }
	},
	{ timestamps: true }
);

export const RefreshToken: Model<IRefreshToken> =
	mongoose.models.RefreshToken || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
