import { PageChatService } from './PageChatService';

export const StreamingStatus = {
  IDLE: 'idle',
  STREAMING: 'streaming',
  COMPLETED: 'completed',
  ABORTED: 'aborted',
} as const;

export type StreamingStatus = (typeof StreamingStatus)[keyof typeof StreamingStatus];

export interface StreamParams {
  message: string;
  model?: string;
  system?: string;
  tool?: string;
}

export interface StreamController {
  currentAbortController: AbortController | null;
  isStreaming: boolean;
  currentMessageId: string | null;

  // Core control methods
  stopCurrentStream(): Promise<void>;
  startNewStream(_messageId: string, _params: StreamParams): Promise<void>;

  // State management
  getStreamingStatus(): StreamingStatus;
  cleanup(): void;
}

export class PageStreamController implements StreamController {
  currentAbortController: AbortController | null = null;
  isStreaming: boolean = false;
  currentMessageId: string | null = null;
  private chatService: PageChatService;
  private streamingStatus: StreamingStatus = StreamingStatus.IDLE;

  constructor(chatService: PageChatService) {
    this.chatService = chatService;
  }

  async stopCurrentStream(): Promise<void> {
    if (!this.isStreaming) {
      return;
    }

    try {
      // Stopping current stream
      this.chatService.abortCurrentStream();

      // AbortController.abort() is synchronous and immediate - no delay needed
      // Reset all state immediately for optimal performance
      this.streamingStatus = StreamingStatus.ABORTED;
      this.isStreaming = false;
      this.currentMessageId = null;
      this.currentAbortController = null;
    } catch (error) {
      console.error('Error stopping stream:', error);
      // Force cleanup even if there's an error
      this.cleanup();
    }
  }

  async startNewStream(_messageId: string, _params: StreamParams): Promise<void> {
    // Auto-stop any existing stream
    if (this.isStreaming) {
      console.log('Auto-stopping existing stream before starting new one');
      await this.stopCurrentStream();
    }

    try {
      console.log(`Starting new stream: ${_messageId}`);
      // Starting new stream
      this.currentMessageId = _messageId;
      this.isStreaming = true;

      // Create new abort controller for this stream
      this.currentAbortController = new AbortController();

      // Set the message ID in the chat service for tracking
      this.chatService.setCurrentStreamingMessageId(_messageId);

      this.streamingStatus = StreamingStatus.STREAMING;
      console.log('Stream status updated to STREAMING');
    } catch (error) {
      console.error('Error starting stream:', error);
      this.cleanup();
      throw error;
    }
  }

  getStreamingStatus(): StreamingStatus {
    return this.streamingStatus;
  }

  cleanup(): void {
    console.log('Cleaning up stream controller state');

    if (this.currentAbortController) {
      this.currentAbortController.abort();
    }

    this.currentAbortController = null;
    this.isStreaming = false;
    this.currentMessageId = null;
    this.streamingStatus = StreamingStatus.IDLE;

    // Clean up chat service state with error handling
    try {
      this.chatService.abortCurrentStream();
    } catch (error) {
      console.warn('Error during service cleanup, continuing with controller cleanup:', error);
    }
    console.log('Stream controller cleanup completed');
  }

  // Utility methods for UI integration
  shouldShowStopButton(): boolean {
    return this.isStreaming && this.streamingStatus === StreamingStatus.STREAMING;
  }

  canStartNewStream(): boolean {
    return (
      !this.isStreaming &&
      (this.streamingStatus === StreamingStatus.IDLE ||
        this.streamingStatus === StreamingStatus.COMPLETED ||
        this.streamingStatus === StreamingStatus.ABORTED)
    );
  }

  // Mark stream as completed (called when stream ends naturally)
  markStreamCompleted(): void {
    console.log('Marking stream as completed');
    this.streamingStatus = StreamingStatus.COMPLETED;
    this.isStreaming = false;
    this.currentMessageId = null;
    this.currentAbortController = null;
  }

  // Get current stream info for debugging
  getCurrentStreamInfo() {
    return {
      status: this.streamingStatus,
      messageId: this.currentMessageId,
      isStreaming: this.isStreaming,
      hasAbortController: !!this.currentAbortController,
      serviceIsStreaming: this.chatService.isStreaming(),
    };
  }
}
