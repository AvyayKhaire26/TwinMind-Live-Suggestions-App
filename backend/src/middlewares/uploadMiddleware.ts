import multer from 'multer';

// Process files strictly in memory so we don't spam disk IO for fast responses.
// Can configure limits if needed (e.g., limits: { fileSize: 25 * 1024 * 1024 })
const storage = multer.memoryStorage();

export const uploadAudio = multer({ 
    storage,
    limits: { fileSize: 25 * 1024 * 1024 } // 25MB standard whisper limit
}).single('audio');
