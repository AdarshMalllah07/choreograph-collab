import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
	email: string;
	name: string;
	passwordHash: string;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		name: { type: String, required: true, trim: true },
		passwordHash: { type: String, required: true }
	},
	{ timestamps: true }
);

export const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
