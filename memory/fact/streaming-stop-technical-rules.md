# Streaming Stop Functionality - Technical Implementation Rules

## Architecture Decisions

### Decision 1: AbortController Integration Strategy
**Context**: PageChatService uses direct fetch API in `streamWithReasoning` method for LangChain streaming
**Decision**: Inject AbortController into streaming lifecycle management
**Rationale**: 
- Native browser API provides clean cancellation without complex state management
- Direct integration with fetch API ensures network-level stream termination
- Avoids custom polling or setTimeout-based interruption mechanisms
**Consequences**: 
- Requires refactoring streamWithReasoning to accept and handle AbortSignal
- Need to manage AbortController lifecycle (creation, cleanup, memory management)
- Must coordinate abort timing with UI state updates

### Decision 2: Partial Content Preservation Strategy
**Context**: AIReasoningMessage maintains separate reasoning and content streams with progressive rendering
**Decision**: Mark interrupted messages in-place rather than discarding partial content
**Rationale**:
- Preserves valuable partial insights for user reference
- Maintains conversation context and flow continuity
- Provides clear user feedback about interruption occurrence
**Consequences**:
- Requires message mutation logic for "[已中断]" marker injection
- Need to handle edge cases (empty content, reasoning-only interruptions)
- Must preserve existing message formatting and structure

### Decision 3: Single Stream Constraint Architecture
**Context**: Chrome extension dual LLM system with potential for concurrent streams
**Decision**: Enforce single active stream with automatic supersession
**Rationale**:
- Simplifies user mental model (one conversation at a time)
- Prevents resource conflicts and API rate limiting issues
- Ensures predictable UI state management
**Consequences**:
- Auto-abort logic required before starting new streams
- Stream state tracking necessary across component lifecycle
- Race condition handling for rapid start/stop sequences

## Implementation Patterns

### Pattern 1: Streaming Control Service
```typescript
interface StreamController {
  currentAbortController: AbortController | null;
  isStreaming: boolean;
  currentMessageId: string | null;
  
  // Core control methods
  stopCurrentStream(): Promise<void>;
  startNewStream(messageId: string, params: StreamParams): Promise<void>;
  
  // State management
  getStreamingStatus(): StreamingStatus;
  cleanup(): void;
}

enum StreamingStatus {
  IDLE = 'idle',
  STARTING = 'starting', 
  STREAMING = 'streaming',
  STOPPING = 'stopping',
  COMPLETED = 'completed',
  ABORTED = 'aborted'
}
```

### Pattern 2: Message State Mutation
```typescript
// Extension to AIReasoningMessage class
interface InterruptibleMessage {
  markAsInterrupted(): void;
  isInterrupted: boolean;
  interruptedAt: Date | null;
}

class AIReasoningMessage implements InterruptibleMessage {
  markAsInterrupted(): void {
    const currentContent = this.getDisplayText();
    const timestamp = new Date();
    
    // Preserve existing content and add interruption marker
    this.content = currentContent 
      ? `${currentContent}\n\n[已中断]` 
      : '[已中断]';
    
    this.isInterrupted = true;
    this.interruptedAt = timestamp;
    this.status = MessageStatus.INTERRUPTED;
  }
}
```

### Pattern 3: UI State Coordination  
```typescript
// In PagePanel component
const useStreamingControl = () => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const streamControllerRef = useRef<StreamController>(new StreamController());
  
  const stopStream = useCallback(async () => {
    await streamControllerRef.current.stopCurrentStream();
    setIsStreaming(false);
    setCurrentStreamId(null);
  }, []);
  
  const startStream = useCallback(async (messageId: string, params: StreamParams) => {
    // Auto-stop any existing stream
    if (isStreaming) {
      await stopStream();
    }
    
    await streamControllerRef.current.startNewStream(messageId, params);
    setIsStreaming(true);
    setCurrentStreamId(messageId);
  }, [isStreaming, stopStream]);
  
  return { isStreaming, currentStreamId, stopStream, startStream };
};
```

### Pattern 4: AbortController Lifecycle Management
```typescript
class PageChatService {
  private currentAbortController: AbortController | null = null;
  
  async streamWithReasoning(
    params: StreamParams,
    abortSignal?: AbortSignal
  ): Promise<StreamResult> {
    // Create new abort controller if none provided
    const controller = new AbortController();
    this.currentAbortController = controller;
    
    // Chain provided abort signal if exists
    if (abortSignal) {
      abortSignal.addEventListener('abort', () => controller.abort());
    }
    
    try {
      const response = await fetch(url, {
        signal: controller.signal,
        // ... other fetch options
      });
      
      // Process streaming response with abort checking
      return await this.processStream(response, controller.signal);
      
    } catch (error) {
      if (error.name === 'AbortError') {
        return { status: 'aborted', partialContent: this.getCurrentContent() };
      }
      throw error;
    } finally {
      this.currentAbortController = null;
    }
  }
  
  abortCurrentStream(): void {
    if (this.currentAbortController) {
      this.currentAbortController.abort();
      this.currentAbortController = null;
    }
  }
}
```

## Quality Rules

### Performance Rules
- **Stream Termination Speed**: Stop operations must complete within 100ms for responsive UX
- **Memory Cleanup**: AbortControllers must be properly disposed to prevent memory leaks
- **Network Efficiency**: Aborted requests should not continue consuming bandwidth
- **UI Responsiveness**: Stop button state updates must be synchronous (no async delays)

### Security Rules
- **Signal Validation**: Validate abort signals to prevent malicious stream manipulation
- **Content Sanitization**: Ensure "[已中断]" marker injection doesn't introduce XSS vulnerabilities
- **Resource Limits**: Prevent rapid start/stop sequences from overwhelming system resources

### Maintainability Rules
- **Separation of Concerns**: Streaming control logic encapsulated in dedicated service class
- **State Management**: Clear distinction between UI state and streaming state
- **Error Handling**: Comprehensive error scenarios for abort operations (network errors, race conditions)
- **Logging**: Detailed logging for streaming lifecycle events for debugging

## Integration Guidelines

### PagePanel Component Integration
```typescript
// Integration points in PagePanel.tsx
export function PagePanel() {
  const { isStreaming, stopStream, startStream } = useStreamingControl();
  
  // Stop button component
  const StopButton = () => (
    <div className="absolute -bottom-4 left-0 right-0 py-1 flex justify-center">
      {isStreaming && (
        <button
          className="opacity-100 transition-all duration-200 text-gray-600 bg-gray-100 hover:bg-black hover:text-white rounded px-2 py-0.5"
          onClick={stopStream}
          title="停止生成"
          aria-label="Stop current streaming response">
          <StopIcon className="w-3 h-3" />
        </button>
      )}
    </div>
  );
  
  // Auto-stop integration in send handler
  const handleSend = async (message: string) => {
    const messageId = generateMessageId();
    await startStream(messageId, { message, model, system });
  };
}
```

### PageChatService Integration
- Modify `streamWithReasoning` method to accept AbortSignal parameter
- Add abort event listeners to streaming response processing
- Implement partial content preservation for interrupted streams
- Add stream status tracking for UI coordination

### Message System Integration
- Extend AIReasoningMessage with interruption capabilities
- Add "[已中断]" marker injection logic with proper formatting
- Implement message status updates for interrupted state
- Ensure interrupted messages display correctly in chat history

## Testing Strategy Integration
- **Unit Tests**: StreamController state transitions, AbortController lifecycle
- **Integration Tests**: PagePanel ↔ PageChatService ↔ Network interaction
- **Race Condition Tests**: Rapid start/stop/start sequences
- **UI Responsiveness Tests**: Button visibility and state update timing
- **Memory Leak Tests**: AbortController cleanup verification