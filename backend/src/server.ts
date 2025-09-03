import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connect } from './utils/db';
import authRouter from './routes/auth.routes';
import projectRouter from './routes/project.routes';
import taskRouter from './routes/task.routes';
import columnRouter from './routes/column.routes';

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
	res.json({ ok: true, service: 'choreograph-collab-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/projects', taskRouter);
app.use('/api/projects', columnRouter);

const port = Number(process.env.PORT || 5000);

connect()
	.then(() => {
		app.listen(port, () => {
			// eslint-disable-next-line no-console
			console.log(`API listening on http://localhost:${port}`);
		});
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Failed to start server', err);
		process.exit(1);
	});
