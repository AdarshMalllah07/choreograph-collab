import mongoose, { Schema } from 'mongoose';
const TaskSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    status: { type: String, default: 'todo', index: true },
    assignee: { type: Schema.Types.ObjectId, ref: 'User' },
    order: { type: Number, default: 0 },
    deadline: { type: Date, default: null }
}, { timestamps: true });
TaskSchema.index({ project: 1, order: 1 });
export const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
