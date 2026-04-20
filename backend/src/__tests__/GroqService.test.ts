import { GroqService } from '../services/GroqService';

const mockGroq = jest.fn().mockImplementation(() => {
    return {
        chat: {
            completions: {
                create: jest.fn().mockResolvedValue({
                    choices: [{ message: { content: '{"suggestions": [{"preview": "Test", "action": "Action desc"}]}' } }]
                })
            }
        }
    };
});
(mockGroq as any).toFile = jest.fn();

jest.mock('groq-sdk', () => mockGroq);

describe('GroqService Tests', () => {
    let service: GroqService;

    beforeAll(() => {
        service = GroqService.getInstance();
    });

    it('getInstance should return a singleton', () => {
        const anotherInstance = GroqService.getInstance();
        expect(service).toBe(anotherInstance);
    });

    it('generateSuggestions should parse JSON successfully', async () => {
        const suggestions = await service.generateSuggestions('fake-key', {
            transcript: "hello test"
        });
        
        expect(suggestions.length).toBeGreaterThan(0);
        expect(suggestions[0].preview).toBe("Test");
    });
});
