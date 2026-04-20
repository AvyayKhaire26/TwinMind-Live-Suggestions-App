import { useRef, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ApiService } from '../services/ApiService';
import { CHUNK_INTERVAL_MS, FIRST_CHUNK_INTERVAL_MS } from '../constants';
import type { TranscriptChunk } from '../types';

export type MicStatus = 'idle' | 'recording' | 'processing';

interface UseMicrophoneProps {
  apiKey: string;
  onChunkTranscribed: (chunk: TranscriptChunk) => void;
  onError: (msg: string) => void;
}

/**
 * useMicrophone — single-responsibility hook encapsulating all Web Audio logic.
 * Uses MediaRecorder.requestData() every 30s so recording never stops.
 */
export function useMicrophone({ apiKey, onChunkTranscribed, onError }: UseMicrophoneProps) {
  const [status, setStatus] = useState<MicStatus>('idle');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const processChunk = useCallback(
    async (blob: Blob) => {
      if (blob.size < 1000) return; // skip near-empty blobs
      try {
        const text = await ApiService.transcribeAudio(apiKey, blob);
        if (!text.trim()) return;
        onChunkTranscribed({
          id: uuidv4(),
          text: text.trim(),
          timestamp: new Date(),
        });
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Transcription failed');
      }
    },
    [apiKey, onChunkTranscribed, onError]
  );

  const startRecording = useCallback(async () => {
    if (!apiKey) {
      onError('Please set your Groq API key in Settings first.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Prefer webm/opus; fallback for Safari
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : 'audio/webm';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      const scheduleNextStop = (delay: number) => {
        intervalRef.current = setTimeout(() => {
          if (mediaRecorderRef.current?.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, delay);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        chunksRef.current = [];
        processChunk(blob);
        
        // If recording is still active (intervalRef exists), restart immediately
        if (intervalRef.current) {
          try {
            recorder.start();
            scheduleNextStop(CHUNK_INTERVAL_MS);
          } catch (e) {
            console.error('Failed to restart mic', e);
          }
        }
      };

      recorder.start();
      setStatus('recording');
      scheduleNextStop(FIRST_CHUNK_INTERVAL_MS); // first chunk very quick
    } catch {
      onError('Microphone access denied. Please allow microphone permissions.');
    }
  }, [apiKey, onError, processChunk]);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.stop(); // onstop will fire one last time and NOT restart because intervalRef is null
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());
    setStatus('idle');
  }, [processChunk]);

  return { status, startRecording, stopRecording };
}
