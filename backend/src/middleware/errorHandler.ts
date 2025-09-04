import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
	statusCode?: number;
	code?: string | number;
	keyValue?: any;
}

export function errorHandler(
	err: AppError,
	req: Request,
	res: Response,
	next: NextFunction
) {
	console.error('Error:', err);

	// Handle MongoDB duplicate key errors
	if (err.code === 11000) {
		const keyValue = err.keyValue;
		let message = 'Duplicate key error';
		let details = {};

		if (keyValue) {
			if (keyValue.project && keyValue.order !== undefined) {
				message = `Column with order ${keyValue.order} already exists in this project`;
				details = {
					error: 'DUPLICATE_ORDER',
					conflictingOrder: keyValue.order,
					suggestion: 'Choose a different order or let the system assign one automatically'
				};
			} else if (keyValue.email) {
				message = 'User with this email already exists';
				details = {
					error: 'DUPLICATE_EMAIL',
					suggestion: 'Use a different email address or try logging in'
				};
			} else {
				message = 'Duplicate key constraint violation';
				details = {
					error: 'DUPLICATE_KEY',
					conflictingFields: Object.keys(keyValue)
				};
			}
		}

		return res.status(409).json({
			message,
			...details
		});
	}

	// Handle MongoDB validation errors
	if (err.name === 'ValidationError') {
		const validationErrors: any = {};
		if (err.message.includes('Path')) {
			// Parse mongoose validation error
			const matches = err.message.match(/Path `(\w+)` is required/);
			if (matches) {
				validationErrors[matches[1]] = 'This field is required';
			}
		}

		return res.status(400).json({
			message: 'Validation failed',
			error: 'VALIDATION_ERROR',
			details: validationErrors
		});
	}

	// Handle MongoDB cast errors (invalid ObjectId)
	if (err.name === 'CastError') {
		return res.status(400).json({
			message: 'Invalid ID format',
			error: 'INVALID_ID',
			suggestion: 'Please provide a valid ID'
		});
	}

	// Handle JWT errors
	if (err.name === 'JsonWebTokenError') {
		return res.status(401).json({
			message: 'Invalid token',
			error: 'INVALID_TOKEN',
			suggestion: 'Please log in again'
		});
	}

	if (err.name === 'TokenExpiredError') {
		return res.status(401).json({
			message: 'Token expired',
			error: 'TOKEN_EXPIRED',
			suggestion: 'Please log in again'
		});
	}

	// Handle custom app errors
	if (err.statusCode) {
		return res.status(err.statusCode).json({
			message: err.message,
			error: 'CUSTOM_ERROR'
		});
	}

	// Default error
	return res.status(500).json({
		message: 'Internal server error',
		error: 'INTERNAL_ERROR',
		suggestion: 'Please try again later'
	});
}

export function notFoundHandler(req: Request, res: Response) {
	res.status(404).json({
		message: `Route ${req.originalUrl} not found`,
		error: 'NOT_FOUND',
		suggestion: 'Check the API documentation for available endpoints'
	});
}
