import { Request, Response, NextFunction } from 'express';
import { GroqService } from '../services/GroqService';
import { logger } from '../config/logger';
import { AppError } from '../exceptions/AppError';

export class TranscriptionController {
    
    // Using property arrow functions or binding is helpful for Express class methods
    public static async handleTranscription(req: Request, res: Response, next: NextFunction) {
        logger.info("Inside TranscriptionController handleTranscription()");
        try {
            const apiKey = res.locals.groqApiKey;
            
            if (!req.file) {
                logger.error("No audio file provided in request");
                throw new AppError("No audio file found in request", 400);
            }

            const audioService = GroqService.getInstance();
            
            const transcript = await audioService.transcribeAudio(apiKey, {
                fileBuffer: req.file.buffer,
                fileName: req.file.originalname || `audio-${Date.now()}.webm`,
                mimeType: req.file.mimetype
            });

            logger.info("End of TranscriptionController handleTranscription()");
            res.status(200).json({
                status: 'success',
                data: {
                    transcript
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
