import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middlewares/errorHandler';
import { logger } from './config/logger';

const app: Application = express();

// Security Middleware
app.use(helmet());

// CORS config (allow all for simple local development, restrict in production)
app.use(cors());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup request logging with Morgan, delegating to Winston
app.use(morgan('combined', {
    stream: {
        write: (message: string) => logger.info(message.trim())
    }
}));

import apiRouter from './routes';

// Route Middlewares
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'TwinMind Backend is running' });
});

app.use('/api/v1', apiRouter);

// 404 Route handler
app.use((req: Request, res: Response) => {
    res.status(404).json({
        status: 'error',
        message: `Cant find ${req.originalUrl} on this server!`
    });
});

// Global Error Handler
app.use(errorHandler);

export default app;
