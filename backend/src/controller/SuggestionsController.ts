import { Request, Response, NextFunction } from 'express';
import { GroqService } from '../services/GroqService';
import { logger } from '../config/logger';
import { AppError } from '../exceptions/AppError';

export class SuggestionsController {
    
    public static async handleSuggestions(req: Request, res: Response, next: NextFunction) {
        logger.info("Inside SuggestionsController handleSuggestions()");
        try {
            const apiKey = res.locals.groqApiKey;
            const { transcript, customPrompt } = req.body;

            if (!transcript) {
                logger.error("No transcript provided in request body");
                throw new AppError("Transcript is required to generate suggestions", 400);
            }

            const llmService = GroqService.getInstance();
            
            const suggestions = await llmService.generateSuggestions(apiKey, {
                transcript,
                customPrompt
            });

            logger.info("End of SuggestionsController handleSuggestions()");
            res.status(200).json({
                status: 'success',
                data: {
                    suggestions
                }
            });
        } catch (error) {
            next(error);
        }
    }
}
