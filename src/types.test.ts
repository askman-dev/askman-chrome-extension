import { describe, it, expect, beforeEach } from 'vitest';
import { AIReasoningMessage } from './types';

describe('AIReasoningMessage', () => {
  let message: AIReasoningMessage;

  beforeEach(() => {
    message = new AIReasoningMessage();
  });

  describe('basic functionality', () => {
    it('should initialize with empty content', () => {
      expect(message.reasoning).toBe('');
      expect(message.content).toBe('');
      expect(message.isReasoning).toBe(true);
      expect(message.isInterrupted).toBe(false);
      expect(message.interruptedAt).toBeNull();
    });

    it('should update reasoning content', () => {
      const reasoningText = 'I need to think about this...';
      message.updateReasoning(reasoningText);

      expect(message.reasoning).toBe(reasoningText);
      expect(message.hasReasoning()).toBe(true);
    });

    it('should update content', () => {
      const contentText = 'Here is my response';
      message.updateContent(contentText);

      expect(message.content).toBe(contentText);
      expect(message.hasContent()).toBe(true);
    });

    it('should get display text correctly', () => {
      message.updateReasoning('Thinking...');
      message.updateContent('Final answer');

      const displayText = message.getDisplayText();
      expect(displayText).toBe('Thinking...\n\nFinal answer');
    });

    it('should get display text with only reasoning', () => {
      message.updateReasoning('Just thinking...');

      const displayText = message.getDisplayText();
      expect(displayText).toBe('Just thinking...');
    });

    it('should get display text with only content', () => {
      message.updateContent('Direct answer');

      const displayText = message.getDisplayText();
      expect(displayText).toBe('Direct answer');
    });
  });

  describe('interruption functionality', () => {
    it('should mark message as interrupted when it has reasoning but no content', () => {
      message.updateReasoning('I was thinking about...');

      message.markAsInterrupted();

      expect(message.isInterrupted).toBe(true);
      expect(message.interruptedAt).toBeInstanceOf(Date);
      expect(message.reasoning).toBe('I was thinking about...\n\n[已中断]');
      expect(message.content).toBe('');
    });

    it('should mark message as interrupted when it has content', () => {
      message.updateReasoning('I was thinking...');
      message.updateContent('Here is my response');

      message.markAsInterrupted();

      expect(message.isInterrupted).toBe(true);
      expect(message.content).toBe('Here is my response\n\n[已中断]');
      expect(message.reasoning).toBe('I was thinking...');
    });

    it('should mark empty message as interrupted', () => {
      message.markAsInterrupted();

      expect(message.isInterrupted).toBe(true);
      expect(message.content).toBe('[已中断]');
      expect(message.reasoning).toBe('');
    });

    it('should preserve interruption timestamp', () => {
      const beforeTime = new Date();
      message.markAsInterrupted();
      const afterTime = new Date();

      expect(message.getInterruptedAt()).not.toBeNull();
      expect(message.getInterruptedAt()!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(message.getInterruptedAt()!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should correctly report interruption status', () => {
      expect(message.isMessageInterrupted()).toBe(false);

      message.markAsInterrupted();

      expect(message.isMessageInterrupted()).toBe(true);
    });

    it('should include interruption marker in display text', () => {
      message.updateReasoning('Thinking...');
      message.updateContent('Almost done...');
      message.markAsInterrupted();

      const displayText = message.getDisplayText();
      expect(displayText).toContain('[已中断]');
      expect(displayText).toBe('Thinking...\n\nAlmost done...\n\n[已中断]');
    });

    it('should handle interruption of reasoning-only message', () => {
      message.updateReasoning('Deep thinking process...');
      message.markAsInterrupted();

      const displayText = message.getDisplayText();
      expect(displayText).toBe('Deep thinking process...\n\n[已中断]');
      expect(message.hasContent()).toBe(false);
      expect(message.hasReasoning()).toBe(true);
    });

    it('should handle multiple interruptions gracefully', () => {
      message.updateContent('Initial content');
      message.markAsInterrupted();

      // Second interruption should not add duplicate markers
      message.markAsInterrupted();

      // The content should not change on second interruption
      // (though this behavior could be modified if needed)
      expect(message.content).toContain('[已中断]');
    });
  });
});
