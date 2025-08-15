import React, { useState } from 'react';
import MultiColumnCanvas from '@src/features/prism/canvas/MultiColumnCanvas';
import type { ChatColumn } from '@src/features/prism/canvas/types';
import type { ToolsPromptInterface } from '@src/types';
import type { CanvasMessage } from '@src/features/prism/canvas/types';

// Type alias for backward compatibility
type ChatMessage = CanvasMessage;
import { streamChatResponse } from '@src/features/prism/services/PrismChatService';
import withSuspense from '@src/shared/hoc/withSuspense';
import withErrorBoundary from '@src/shared/hoc/withErrorBoundary';

function ThoughtPrism() {
  const [columns, setColumns] = useState<ChatColumn[]>([
    {
      id: 'main-col',
      messages: [],
      isActive: true,
      metadata: { title: 'Conversation', createdAt: new Date(), lastActivity: new Date() },
    },
  ]);

  const sendMessage = async (
    columnId: string,
    content: string,
    parentId?: string,
    options?: { tool?: ToolsPromptInterface; systemPrompt?: string; model?: string },
  ) => {
    if (!content) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content,
      children: [],
      parentId: parentId,
      createdAt: new Date(),
    };

    // 更新列的消息状态
    setColumns(prevColumns =>
      prevColumns.map(column => {
        if (column.id === columnId) {
          const currentMessages = [...column.messages, userMessage];
          return {
            ...column,
            messages: currentMessages,
            metadata: {
              ...column.metadata,
              lastActivity: new Date(),
            },
          };
        }
        return column;
      }),
    );

    try {
      console.log('UI: Calling streamChatResponse');
      const currentColumn = columns.find(col => col.id === columnId);
      const currentMessages = [...(currentColumn?.messages || []), userMessage];

      // Convert to CoreMessage format for the AI service
      const coreMessages = currentMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
      }));

      const streamResult = await streamChatResponse(coreMessages, {
        systemPrompt: options?.systemPrompt,
        model: options?.model,
        tool: options?.tool,
      });
      const { textStream } = streamResult;

      let fullResponse = '';
      const assistantMessageId = (Date.now() + 1).toString();

      for await (const delta of textStream) {
        fullResponse += delta;

        setColumns(prevColumns =>
          prevColumns.map(column => {
            if (column.id === columnId) {
              const assistantExists = column.messages.some(msg => msg.id === assistantMessageId);

              if (!assistantExists) {
                const newAssistantMessage: ChatMessage = {
                  id: assistantMessageId,
                  role: 'assistant',
                  content: fullResponse,
                  children: [],
                  parentId: userMessage.id,
                  createdAt: new Date(),
                };
                return {
                  ...column,
                  messages: [...column.messages, newAssistantMessage],
                };
              } else {
                return {
                  ...column,
                  messages: column.messages.map(msg =>
                    msg.id === assistantMessageId ? { ...msg, content: fullResponse } : msg,
                  ),
                };
              }
            }
            return column;
          }),
        );
      }
      console.log('UI: textStream iteration completed');
    } catch (error) {
      console.error('An error occurred during the stream:', error);
      const errorAssistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        children: [],
        parentId: userMessage.id,
        createdAt: new Date(),
      };
      setColumns(prevColumns =>
        prevColumns.map(column => {
          if (column.id === columnId) {
            return {
              ...column,
              messages: [...column.messages, errorAssistantMessage],
            };
          }
          return column;
        }),
      );
    }
  };

  const handleBranchCreate = (fromColumnId: string, fromMessageId: string) => {
    try {
      const sourceColumn = columns.find(col => col.id === fromColumnId);
      if (!sourceColumn) {
        console.error('Branch creation failed: Source column not found', { fromColumnId });
        return '';
      }

      // 找到分叉点消息的索引
      const branchPointIndex = sourceColumn.messages.findIndex(msg => msg.id === fromMessageId);
      if (branchPointIndex === -1) {
        console.error('Branch creation failed: Branch point message not found', { fromColumnId, fromMessageId });
        return '';
      }

      // 复制从开始到分叉点的所有消息
      const branchMessages = sourceColumn.messages.slice(0, branchPointIndex + 1);

      const newColumn: ChatColumn = {
        id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        messages: branchMessages.map(msg => ({
          id: msg.id,
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
          createdAt: msg.createdAt || new Date(),
          parentId: msg.parentId,
        })),
        parentColumnId: fromColumnId,
        branchPoint: fromMessageId,
        isActive: false,
        metadata: {
          title: `Branch from ${sourceColumn.metadata.title || 'Column'}`,
          createdAt: new Date(),
          lastActivity: new Date(),
        },
      };

      setColumns(prev => [...prev, newColumn]);
      console.log('Branch created successfully', {
        newColumnId: newColumn.id,
        fromColumnId,
        fromMessageId,
        messageCount: branchMessages.length,
      });
      return newColumn.id;
    } catch (error) {
      console.error('Branch creation failed with error:', error);
      // 显示错误提示（这里可以根据需要添加更友好的错误处理）
      alert('Failed to create branch. Please try again.');
      return '';
    }
  };

  const processedColumns = columns.map(column => ({
    ...column,
    messages: column.messages.map(m => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: m.createdAt || new Date(),
      parentId: m.parentId,
    })),
  }));

  return (
    <div className="w-screen h-screen overflow-hidden">
      <MultiColumnCanvas
        columns={processedColumns}
        className="w-full h-full"
        onMessageCreate={(columnId, content, parentId, options) => {
          sendMessage(columnId, content, parentId, options);
        }}
        onBranchCreate={handleBranchCreate}
      />
    </div>
  );
}

export default withErrorBoundary(withSuspense(ThoughtPrism, <div> Loading ... </div>), <div> Error Occur </div>);
