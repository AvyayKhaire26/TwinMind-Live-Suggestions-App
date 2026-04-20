import { Request, Response, NextFunction } from 'express';
import { GroqService } from '../services/GroqService';
import { logger } from '../config/logger';
import { AppError } from '../exceptions/AppError';

export class ChatController {
    
    public static async handleChat(req: Request, res: Response, next: NextFunction) {
        logger.info("Inside ChatController handleChat()");
        try {
            const apiKey = res.locals.groqApiKey;
            const { transcriptContext, chatHistory, suggestionContext, customPrompt } = req.body;

            if (!transcriptContext) {
                logger.error("No transcriptContext provided in request body");
                throw new AppError("Transcript context is required for chat", 400);
            }
            if (!Array.isArray(chatHistory)) {
                logger.error("Invalid chatHistory format");
                throw new AppError("Chat history must be an array", 400);
            }

            const llmService = GroqService.getInstance();
            
            const stream = await llmService.generateChatResponse(apiKey, {
                transcriptContext,
                chatHistory,
                suggestionContext,
                customPrompt
            });

            // Set headers for Server-Sent Events (SSE)
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            res.flushHeaders(); // Ensure headers are sent immediately

            for await (const chunk of stream) {
                const textChunk = chunk.choices[0]?.delta?.content || "";
                if (textChunk) {
                    res.write(`data: ${JSON.stringify({ text: textChunk })}\n\n`);
                }
            }

            res.write('data: [DONE]\n\n');
            res.end();
            logger.info("End of ChatController handleChat (Stream Completed)");

        } catch (error) {
            next(error);
        }
    }
}
