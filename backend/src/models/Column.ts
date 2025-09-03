import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IColumn extends Document {
	project: Types.ObjectId;
	name: string;
	order: number;
	createdAt: Date;
	updatedAt: Date;
}

const ColumnSchema = new Schema<IColumn>(
	{
		project: { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
		name: { type: String, required: true, trim: true },
		order: { type: Number, default: 0 }
	},
	{ timestamps: true }
);

ColumnSchema.index({ project: 1, order: 1 }, { unique: true, name: 'project_order_unique' });

export const Column: Model<IColumn> =
	mongoose.models.Column || mongoose.model<IColumn>('Column', ColumnSchema);
