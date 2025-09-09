import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PageStreamController, StreamingStatus } from './StreamController';
import { PageChatService } from './PageChatService';

// Mock PageChatService
vi.mock('./PageChatService', () => {
  return {
    PageChatService: vi.fn().mockImplementation(() => ({
      abortCurrentStream: vi.fn(),
      isStreaming: vi.fn(() => false),
      setCurrentStreamingMessageId: vi.fn(),
      getCurrentStreamingMessageId: vi.fn(() => null),
    })),
  };
});

describe('PageStreamController', () => {
  let mockChatService: PageChatService;
  let streamController: PageStreamController;

  beforeEach(() => {
    mockChatService = new PageChatService();
    streamController = new PageStreamController(mockChatService);
  });

  describe('initialization', () => {
    it('should initialize with idle status', () => {
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.IDLE);
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
    });
  });

  describe('startNewStream', () => {
    it('should set streaming state when starting new stream', async () => {
      const messageId = 'test-message-123';
      const params = { message: 'Hello world' };

      await streamController.startNewStream(messageId, params);

      expect(streamController.isStreaming).toBe(true);
      expect(streamController.currentMessageId).toBe(messageId);
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.STREAMING);
      expect(mockChatService.setCurrentStreamingMessageId).toHaveBeenCalledWith(messageId);
    });

    it('should auto-stop existing stream when starting new one', async () => {
      // First stream
      await streamController.startNewStream('msg1', { message: 'First message' });
      expect(streamController.isStreaming).toBe(true);

      // Second stream should auto-stop first
      const abortSpy = vi.spyOn(mockChatService, 'abortCurrentStream');
      await streamController.startNewStream('msg2', { message: 'Second message' });

      expect(abortSpy).toHaveBeenCalled();
      expect(streamController.currentMessageId).toBe('msg2');
    });
  });

  describe('stopCurrentStream', () => {
    it('should stop active stream and reset state', async () => {
      // Start a stream first
      await streamController.startNewStream('test-msg', { message: 'Test' });
      expect(streamController.isStreaming).toBe(true);

      // Stop the stream
      await streamController.stopCurrentStream();

      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.ABORTED);
      expect(mockChatService.abortCurrentStream).toHaveBeenCalled();
    });

    it('should handle stopping when no stream is active', async () => {
      // Should not throw error
      await streamController.stopCurrentStream();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.IDLE);
    });

    it('should complete stop operation within 100ms timing requirement', async () => {
      // Start a stream first
      await streamController.startNewStream('timing-test', { message: 'Speed test' });
      expect(streamController.isStreaming).toBe(true);

      // Measure stop operation timing
      const startTime = performance.now();
      await streamController.stopCurrentStream();
      const endTime = performance.now();

      const duration = endTime - startTime;

      // Verify meets 100ms requirement with reasonable tolerance
      expect(duration).toBeLessThan(100);
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.ABORTED);
    });
  });

  describe('UI helper methods', () => {
    it('shouldShowStopButton returns correct state', async () => {
      expect(streamController.shouldShowStopButton()).toBe(false);

      await streamController.startNewStream('test', { message: 'Test' });
      expect(streamController.shouldShowStopButton()).toBe(true);

      await streamController.stopCurrentStream();
      expect(streamController.shouldShowStopButton()).toBe(false);
    });

    it('canStartNewStream returns correct state', async () => {
      expect(streamController.canStartNewStream()).toBe(true);

      await streamController.startNewStream('test', { message: 'Test' });
      expect(streamController.canStartNewStream()).toBe(false);

      await streamController.stopCurrentStream();
      expect(streamController.canStartNewStream()).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should properly clean up all state', async () => {
      await streamController.startNewStream('test', { message: 'Test' });

      streamController.cleanup();

      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.IDLE);
      expect(mockChatService.abortCurrentStream).toHaveBeenCalled();
    });
  });

  describe('markStreamCompleted', () => {
    it('should mark stream as completed and reset state', async () => {
      // Start a stream
      await streamController.startNewStream('test-msg', { message: 'Test' });
      expect(streamController.isStreaming).toBe(true);
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.STREAMING);

      // Mark as completed
      streamController.markStreamCompleted();

      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.COMPLETED);
      expect(streamController.shouldShowStopButton()).toBe(false);
      expect(streamController.canStartNewStream()).toBe(true);
    });
  });

  describe('getCurrentStreamInfo', () => {
    it('should return complete stream information', async () => {
      const info = streamController.getCurrentStreamInfo();

      expect(info).toHaveProperty('status');
      expect(info).toHaveProperty('messageId');
      expect(info).toHaveProperty('isStreaming');
      expect(info).toHaveProperty('hasAbortController');
      expect(info).toHaveProperty('serviceIsStreaming');
    });
  });

  describe('Race condition handling', () => {
    it('should handle rapid start-stop-start sequences without state corruption', async () => {
      // Rapid sequence: start -> stop -> start
      await streamController.startNewStream('msg1', { message: 'Test 1' });
      expect(streamController.isStreaming).toBe(true);
      expect(streamController.currentMessageId).toBe('msg1');

      await streamController.stopCurrentStream();
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();

      await streamController.startNewStream('msg2', { message: 'Test 2' });
      expect(streamController.isStreaming).toBe(true);
      expect(streamController.currentMessageId).toBe('msg2');

      // Verify final state is consistent
      const status = streamController.getStreamingStatus();
      expect(status).toBe(StreamingStatus.STREAMING);
    });

    it('should handle multiple rapid stop calls without errors', async () => {
      // Start a stream
      await streamController.startNewStream('rapid-test', { message: 'Rapid test' });
      expect(streamController.isStreaming).toBe(true);

      // Multiple rapid stops should not throw errors or cause inconsistent state
      const stopPromises = [
        streamController.stopCurrentStream(),
        streamController.stopCurrentStream(),
        streamController.stopCurrentStream(),
      ];

      await Promise.all(stopPromises);

      // State should be consistently stopped
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.ABORTED);
    });

    it('should handle cleanup during active operations', async () => {
      // Start a stream
      await streamController.startNewStream('cleanup-test', { message: 'Cleanup test' });
      expect(streamController.isStreaming).toBe(true);

      // Call cleanup while streaming (simulates component unmount during active stream)
      streamController.cleanup();

      // Verify complete cleanup
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.IDLE);
      expect(mockChatService.abortCurrentStream).toHaveBeenCalled();
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle service errors gracefully during stop operations', async () => {
      // Mock service to throw an error
      const originalAbort = mockChatService.abortCurrentStream;
      mockChatService.abortCurrentStream = vi.fn(() => {
        throw new Error('Network error during abort');
      });

      await streamController.startNewStream('error-test', { message: 'Error test' });
      expect(streamController.isStreaming).toBe(true);

      // Stop should handle the error gracefully without throwing
      await expect(streamController.stopCurrentStream()).resolves.not.toThrow();

      // Should still clean up state despite the error
      expect(streamController.isStreaming).toBe(false);
      expect(streamController.currentMessageId).toBeNull();
      // When error occurs, cleanup sets status to IDLE (which is correct behavior)
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.IDLE);

      // Restore original mock
      mockChatService.abortCurrentStream = originalAbort;
    });

    it('should prevent memory leaks by properly cleaning up AbortControllers', async () => {
      // Start and stop multiple streams to verify cleanup
      for (let i = 0; i < 5; i++) {
        await streamController.startNewStream(`leak-test-${i}`, { message: `Test ${i}` });
        expect(streamController.currentAbortController).toBeTruthy();

        await streamController.stopCurrentStream();
        expect(streamController.currentAbortController).toBeNull();
      }

      // Final state should be clean
      expect(streamController.getStreamingStatus()).toBe(StreamingStatus.ABORTED);
      expect(streamController.currentAbortController).toBeNull();
    });

    it('should handle attempts to start stream with invalid parameters', async () => {
      // Test with empty message ID
      const emptyIdPromise = streamController.startNewStream('', { message: 'Valid message' });
      await expect(emptyIdPromise).resolves.not.toThrow();

      // Should still set up basic state
      expect(streamController.currentMessageId).toBe('');
      expect(streamController.isStreaming).toBe(true);
    });
  });
});
