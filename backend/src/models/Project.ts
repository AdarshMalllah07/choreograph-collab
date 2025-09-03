import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IProject extends Document {
	name: string;
	owner: Types.ObjectId;
	members: Types.ObjectId[];
	createdAt: Date;
	updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
	{
		name: { type: String, required: true, trim: true },
		owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
	},
	{ timestamps: true }
);

export const Project: Model<IProject> =
	mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
