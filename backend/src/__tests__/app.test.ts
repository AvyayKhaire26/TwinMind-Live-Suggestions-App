import request from 'supertest';
import app from '../app';

describe('App API Endpoints', () => {
    it('GET /health should return 200 OK', async () => {
        const response = await request(app).get('/health');
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
    });

    it('POST /api/v1/suggestions should return 401 without API Key', async () => {
        const response = await request(app).post('/api/v1/suggestions').send({
            transcript: "Hello world"
        });
        expect(response.status).toBe(401);
        expect(response.body.message).toContain('Missing or invalid Groq API Key');
    });

    it('POST /api/v1/chat should return 401 without API Key', async () => {
        const response = await request(app).post('/api/v1/chat').send({
            transcriptContext: "Hello world",
            chatHistory: []
        });
        expect(response.status).toBe(401);
    });

    it('POST /api/v1/transcribe should return 401 without API Key', async () => {
        const response = await request(app).post('/api/v1/transcribe');
        expect(response.status).toBe(401);
    });
});
