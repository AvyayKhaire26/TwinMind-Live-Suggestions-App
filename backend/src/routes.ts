import { Router } from 'express';
import { TranscriptionController } from './controller/TranscriptionController';
import { SuggestionsController } from './controller/SuggestionsController';
import { ChatController } from './controller/ChatController';
import { requireGroqApiKey } from './middlewares/authMiddleware';
import { uploadAudio } from './middlewares/uploadMiddleware';

const router = Router();

// Apply API Key validation globally to all API routes
router.use(requireGroqApiKey);

// Routes
router.post('/transcribe', uploadAudio, TranscriptionController.handleTranscription);
router.post('/suggestions', SuggestionsController.handleSuggestions);
router.post('/chat', ChatController.handleChat);

export default router;
