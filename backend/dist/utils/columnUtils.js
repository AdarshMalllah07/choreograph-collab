import { Column } from '../models/Column.js';
/**
 * Get the next available order number for a project
 */
export async function getNextColumnOrder(projectId) {
    const highestOrderColumn = await Column.findOne({ project: projectId }).sort({ order: -1 });
    return highestOrderColumn ? highestOrderColumn.order + 1 : 0;
}
/**
 * Check if an order number is available for a project
 */
export async function isOrderAvailable(projectId, order, excludeColumnId) {
    const query = { project: projectId, order };
    if (excludeColumnId) {
        query._id = { $ne: excludeColumnId };
    }
    const existingColumn = await Column.findOne(query);
    return !existingColumn;
}
/**
 * Reorder columns to prevent conflicts
 * This function can be used to automatically fix order conflicts
 */
export async function reorderColumns(projectId) {
    const columns = await Column.find({ project: projectId }).sort({ order: 1 });
    // Update orders to be sequential starting from 0
    for (let i = 0; i < columns.length; i++) {
        if (columns[i].order !== i) {
            await Column.findByIdAndUpdate(columns[i]._id, { order: i });
        }
    }
}
/**
 * Insert column at specific order, shifting others if needed
 */
export async function insertColumnAtOrder(projectId, columnId, targetOrder) {
    // Get all columns with order >= targetOrder
    const columnsToShift = await Column.find({
        project: projectId,
        order: { $gte: targetOrder },
        _id: { $ne: columnId }
    }).sort({ order: 1 });
    // Shift columns to make room
    for (const column of columnsToShift) {
        await Column.findByIdAndUpdate(column._id, { order: column.order + 1 });
    }
    // Update the target column
    await Column.findByIdAndUpdate(columnId, { order: targetOrder });
}
