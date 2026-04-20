export type SuggestionCategory =
    | 'QUESTION TO ASK'
    | 'TALKING POINT'
    | 'ANSWER'
    | 'FACT CHECK'
    | 'CLARIFICATION'
    | 'ACTION ITEM';

export interface Suggestion {
    preview: string;
    action: string;
    category: SuggestionCategory;
}

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface TranscriptionProps {
    fileBuffer: Buffer;
    fileName: string;
    mimeType: string;
}

export interface SuggestionsProps {
    transcript: string;
    customPrompt?: string;
}

export interface ChatProps {
    transcriptContext: string;
    chatHistory: ChatMessage[];
    suggestionContext?: string;
    customPrompt?: string;
}
