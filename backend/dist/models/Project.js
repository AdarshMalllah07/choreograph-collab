import mongoose, { Schema } from 'mongoose';
const ProjectSchema = new Schema({
    name: { type: String, required: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
export const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);
