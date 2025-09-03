import { connect } from '../src/utils/db.js';
import { Column } from '../src/models/Column.js';
import { Project } from '../src/models/Project.js';

async function fixColumnOrdering() {
	try {
		console.log('Connecting to database...');
		await connect();
		console.log('Connected to database');

		// Get all projects
		const projects = await Project.find({});
		console.log(`Found ${projects.length} projects`);

		for (const project of projects) {
			console.log(`\nProcessing project: ${project.name} (${project._id})`);
			
			// Get all columns for this project
			const columns = await Column.find({ project: project._id }).sort({ order: 1 });
			console.log(`Found ${columns.length} columns`);

			if (columns.length === 0) {
				console.log('No columns to fix');
				continue;
			}

			// Check for duplicate orders
			const orderCounts = new Map<number, number>();
			const duplicates: any[] = [];

			for (const column of columns) {
				const count = orderCounts.get(column.order) || 0;
				orderCounts.set(column.order, count + 1);
				
				if (count > 0) {
					duplicates.push({ column, order: column.order });
				}
			}

			if (duplicates.length === 0) {
				console.log('No duplicate orders found');
				continue;
			}

			console.log(`Found ${duplicates.length} columns with duplicate orders`);

			// Fix ordering by reassigning sequential orders
			for (let i = 0; i < columns.length; i++) {
				const column = columns[i];
				if (column.order !== i) {
					console.log(`Fixing column "${column.name}": order ${column.order} -> ${i}`);
					await Column.findByIdAndUpdate(column._id, { order: i });
				}
			}

			console.log('Column ordering fixed for this project');
		}

		console.log('\n✅ Column ordering fix completed successfully!');
		process.exit(0);
	} catch (error) {
		console.error('❌ Error fixing column ordering:', error);
		process.exit(1);
	}
}

// Run the script
fixColumnOrdering();
