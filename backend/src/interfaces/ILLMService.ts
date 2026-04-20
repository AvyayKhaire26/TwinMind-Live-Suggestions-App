import { ChatProps, Suggestion, SuggestionsProps } from '../types/GroqTypes';

export interface ILLMService {
    generateSuggestions(apiKey: string, props: SuggestionsProps): Promise<Suggestion[]>;
    generateChatResponse(apiKey: string, props: ChatProps): Promise<AsyncIterable<any>>;
}
