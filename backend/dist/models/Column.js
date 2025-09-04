import mongoose, { Schema } from 'mongoose';
const ColumnSchema = new Schema({
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 }
}, { timestamps: true });
ColumnSchema.index({ project: 1, order: 1 }, { unique: true, name: 'project_order_unique' });
export const Column = mongoose.models.Column || mongoose.model('Column', ColumnSchema);
