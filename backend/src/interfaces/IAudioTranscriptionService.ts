import { TranscriptionProps } from '../types/GroqTypes';

export interface IAudioTranscriptionService {
    transcribeAudio(apiKey: string, props: TranscriptionProps): Promise<string>;
}
