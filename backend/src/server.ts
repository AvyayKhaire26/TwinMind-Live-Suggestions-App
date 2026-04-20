import app from './app';
import { logger } from './config/logger';

const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, () => {
    logger.info(`Server is successfully running on port ${PORT}`);
});

// Handle unhandled rejections globally
process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION! Shutting down...', err);
    server.close(() => {
        process.exit(1);
    });
});

process.on('uncaughtException', (err: Error) => {
    logger.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    process.exit(1);
});
