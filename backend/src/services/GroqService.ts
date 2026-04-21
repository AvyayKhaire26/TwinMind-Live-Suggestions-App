import Groq from 'groq-sdk';
import { toFile } from 'groq-sdk';
import { IAudioTranscriptionService } from '../interfaces/IAudioTranscriptionService';
import { ILLMService } from '../interfaces/ILLMService';
import { ChatProps, Suggestion, SuggestionsProps, TranscriptionProps } from '../types/GroqTypes';
import { logger } from '../config/logger';
import { AppError } from '../exceptions/AppError';

export class GroqService implements IAudioTranscriptionService, ILLMService {
    private static instance: GroqService;

    private constructor() {
        // Private constructor for Singleton pattern
    }

    public static getInstance(): GroqService {
        if (!GroqService.instance) {
            GroqService.instance = new GroqService();
            logger.info("GroqService Singleton instance created");
        }
        return GroqService.instance;
    }

    private getClient(apiKey: string): Groq {
        return new Groq({ apiKey });
    }

    public async transcribeAudio(apiKey: string, props: TranscriptionProps): Promise<string> {
        logger.info("Inside GroqService transcribeAudio()");
        try {
            const groq = this.getClient(apiKey);
            
            // Bypass disk I/O completely for minimal latency
            // Model 1: Whisper Large V3 for Audio Processing
            const fileObj = await toFile(props.fileBuffer, props.fileName);
            
            const transcription = await groq.audio.transcriptions.create({
                file: fileObj,
                model: "whisper-large-v3",
                response_format: "json",
            });
            
            logger.info("End of GroqService transcribeAudio()");
            return transcription.text;
        } catch (error: any) {
            logger.error("Error in GroqService transcribeAudio()");
            logger.error(error);
            throw new AppError(`Failed to transcribe audio: ${error?.message || 'Unknown error'}`, 500);
        }
    }

    public async generateSuggestions(apiKey: string, props: SuggestionsProps): Promise<Suggestion[]> {
        logger.info("Inside GroqService generateSuggestions()");
        try {
            const groq = this.getClient(apiKey);
            
            // Highly engineered conditional prompt for context-aware classification
            const defaultPrompt = `You are TwinMind, an elite live meeting copilot. 
Analyze the recent rolling transcript of an ongoing conversation.
Your goal is to surface EXACTLY 3 highly useful suggestions, insights, or talking points.

DECISION TRIGGERS (Choose the 3 most relevant based on the current context):
- IF someone makes a bold claim or uncertain guess -> Surface a "FACT CHECK".
- IF the conversation stalls or goes in circles -> Surface a "QUESTION TO ASK" to move forward.
- IF someone asks a question the user needs to answer -> Surface an "ANSWER" or "TALKING POINT" to help them reply.
- IF technical jargon or acronyms are used -> Surface a "CLARIFICATION".
- IF a decision was just agreed upon -> Surface an "ACTION ITEM".

Output MUST be strictly a JSON object with a 'suggestions' array containing exactly 3 objects.
Each object must have:
"preview": A useful sentence delivering instant value (10-20 words).
"category": One of: "QUESTION TO ASK", "TALKING POINT", "ANSWER", "FACT CHECK", "CLARIFICATION", "ACTION ITEM"`;
            
            const systemPrompt = props.customPrompt || defaultPrompt;

            // Model 2: GPT-OSS-120B for Intelligence
            const response = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: `Live Transcript recent context:\n\n${props.transcript}` }
                ],
                model: "openai/gpt-oss-120b",
                temperature: 0.5,
                max_tokens: 800,
                response_format: { type: "json_object" }
            });

            const content = response.choices[0]?.message?.content || '{"suggestions":[]}';
            let parsed: Suggestion[];
            
            try {
                const result = JSON.parse(content);
                parsed = result.suggestions || [];
            } catch (e) {
                logger.error("Failed to parse JSON response from LLM");
                parsed = [];
            }

            logger.info("End of GroqService generateSuggestions()");
            return parsed.slice(0, 3);
        } catch (error: any) {
            logger.error("Error in GroqService generateSuggestions()");
            logger.error(error);
            throw new AppError(`Failed to generate suggestions: ${error?.message || 'Unknown error'}`, 500);
        }
    }

    public async generateChatResponse(apiKey: string, props: ChatProps): Promise<AsyncIterable<any>> {
        logger.info("Inside GroqService generateChatResponse()");
        try {
            const groq = this.getClient(apiKey);
            
            // Handling the "Separate Prompt" Requirement gracefully here if the frontend doesn't pass one
            const isOnClickDeepDive = !!props.suggestionContext;
            
            const defaultChatPrompt = "You are TwinMind, an elite AI meeting executive assistant. Provide concise, highly valuable, and direct answers to the user's chat questions. Base your answers firmly on the transcript context. Do not output conversational filler.";
            
            const defaultOnClickPrompt = "You are TwinMind. The user clicked a live suggestion to request a specific, structured answer. Provide a CONCISE, well-formatted response. Use short bullet points ONLY. Do absolutely NOT output Markdown tables, massive essays, or conversational filler. Get straight to the point based firmly on the transcript context.";

            const dynamicPrompt = props.customPrompt || (isOnClickDeepDive ? defaultOnClickPrompt : defaultChatPrompt);
            
            const messages: any[] = [
                { role: "system", content: dynamicPrompt },
                { role: "system", content: `Meeting Context: \n${props.transcriptContext}` }
            ];

            if (isOnClickDeepDive) {
                messages.push({ role: "system", content: `ACTION TRIGGER: The user clicked on this specific live suggestion: "${props.suggestionContext}". Execute the detailed expansion of this point now.` });
            }

            messages.push(...props.chatHistory);

            // Model 2: GPT-OSS-120B for Intelligence (Streaming enabled)
            const stream = await groq.chat.completions.create({
                messages,
                model: "openai/gpt-oss-120b",
                temperature: isOnClickDeepDive ? 0.5 : 0.7,
                max_tokens: 800,
                stream: true,
            });

            logger.info("Returning streaming response from GroqService generateChatResponse()");
            return stream;
        } catch (error: any) {
            logger.error("Error in GroqService generateChatResponse()");
            logger.error(error);
            throw new AppError(`Failed to generate chat response: ${error?.message || 'Unknown error'}`, 500);
        }
    }
}
