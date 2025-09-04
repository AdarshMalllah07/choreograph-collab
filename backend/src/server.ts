import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { connect } from './utils/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRouter from './routes/auth.routes.js';
import projectRouter from './routes/project.routes.js';
import taskRouter from './routes/task.routes.js';
import columnRouter from './routes/column.routes.js';
import userRouter from './routes/user.routes.js';

dotenv.config();

const app = express();

app.use(helmet());
// Debug CORS configuration
const corsOrigins = process.env.CORS_ORIGIN?.split(',') || '*';
console.log('CORS Origins:', corsOrigins);

app.use(cors({ 
  origin: corsOrigins, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));

app.get('/api/health', (_req, res) => {
	res.json({ ok: true, service: 'choreograph-collab-backend', time: new Date().toISOString() });
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/projects', taskRouter);
app.use('/api/projects', columnRouter);
app.use('/api/users', userRouter);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const port = Number(process.env.PORT || 5001);

connect()
	.then(() => {
		app.listen(port, '0.0.0.0', () => {
			// eslint-disable-next-line no-console
			console.log(`API listening on http://0.0.0.0:${port}`);
			console.log(`Local: http://localhost:${port}`);
			console.log(`Network: http://192.168.29.220:${port}`);
		});
	})
	.catch((err) => {
		// eslint-disable-next-line no-console
		console.error('Failed to start server', err);
		process.exit(1);
	});
