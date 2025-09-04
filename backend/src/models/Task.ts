import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type TaskStatus = string; // free-form, column names per project

export interface ITask extends Document {
	project: Types.ObjectId;
	title: string;
	description?: string;
	status: TaskStatus;
	assignee?: Types.ObjectId;
	order: number;
	deadline?: Date;
	createdAt: Date;
	updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
	{
		project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
		title: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		status: { type: String, default: 'todo', index: true },
		assignee: { type: Schema.Types.ObjectId, ref: 'User' },
		order: { type: Number, default: 0 },
		deadline: { type: Date, default: null }
	},
	{ timestamps: true }
);

TaskSchema.index({ project: 1, order: 1 });

export const Task: Model<ITask> =
	mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
