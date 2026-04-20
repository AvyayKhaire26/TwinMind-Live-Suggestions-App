import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../exceptions/AppError';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = 'Internal Server Error';

    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }

    logger.error(`[Error] ${statusCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    
    // Log the stack trace only for non-operational or 500 errors
    if (!err.name || statusCode === 500) {
        logger.error(err.stack);
    }

    res.status(statusCode).json({
        status: 'error',
        message
    });
};
