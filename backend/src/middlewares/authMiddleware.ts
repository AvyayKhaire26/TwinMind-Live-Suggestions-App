import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { logger } from '../config/logger';

export const requireGroqApiKey = (req: Request, res: Response, next: NextFunction) => {
    logger.info(`Validating Groq API Key for route ${req.originalUrl}`);
    
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        logger.error(`Validation Failed: Missing or invalid Authorization header in ${req.originalUrl}`);
        return next(new AppError('Missing or invalid Groq API Key in Authorization header', 401));
    }

    const apiKey = authHeader.split(' ')[1];
    if (!apiKey) {
        logger.error(`Validation Failed: Empty API Key provided in ${req.originalUrl}`);
        return next(new AppError('Empty Groq API Key provided', 401));
    }

    // Attach to res.locals for downstream handlers to consume easily
    res.locals.groqApiKey = apiKey;
    
    logger.info(`Successfully validated API Key format for ${req.originalUrl}`);
    next();
};
