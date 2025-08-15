import { StorageManager } from '@src/utils/StorageManager';
import { CoreMessage } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';
import type { ToolsPromptInterface } from '@src/types';
import { Handlebars } from '@src/../third-party/kbn-handlebars/src/handlebars';

export async function streamChatResponse(
  messages: CoreMessage[],
  options?: { systemPrompt?: string; model?: string; tool?: ToolsPromptInterface },
) {
  try {
    const modelConfigs = await StorageManager.getModelConfig();

    // Find provider and model with default=true, fallback to first available
    let selectedProvider = null;
    let selectedModel = null;

    // If specific model is requested, try to find it first
    if (options?.model) {
      for (const providerConfig of modelConfigs) {
        const requestedModel = providerConfig.config.models.find(
          m => `${providerConfig.provider}/${m.name}` === options.model || m.name === options.model,
        );
        if (requestedModel) {
          selectedProvider = providerConfig;
          selectedModel = requestedModel;
          break;
        }
      }
    }

    // First, look for a model with default=true across all providers
    if (!selectedProvider) {
      for (const providerConfig of modelConfigs) {
        const defaultModel = providerConfig.config.models.find(m => m.default === true);
        if (defaultModel) {
          selectedProvider = providerConfig;
          selectedModel = defaultModel;
          break;
        }
      }
    }

    // Fallback: use first provider and first model if no default found
    if (!selectedProvider && modelConfigs.length > 0) {
      selectedProvider = modelConfigs[0];
      selectedModel = selectedProvider.config.models[0];
    }

    if (!selectedProvider || !selectedModel) {
      throw new Error('No suitable AI provider or model configured in models.toml');
    }

    const { base_url: baseUrl, api_key: apiKey } = selectedProvider.config;

    // Create a custom OpenAI-compatible provider instance
    const customProvider = createOpenAI({
      baseURL: baseUrl,
      apiKey: apiKey,
    });

    // Prepare messages with tool processing and optional system prompt
    let processedMessages = [...messages];

    // Process tool if provided
    if (options?.tool && processedMessages.length > 0) {
      const lastMessage = processedMessages[processedMessages.length - 1];
      if (lastMessage.role === 'user') {
        try {
          // Create template from tool's HBS using compileAST (CSP-safe)
          const template = Handlebars.compileAST(options.tool.hbs);

          // Create context for template processing
          const context = {
            input: lastMessage.content,
            chat: {
              input: lastMessage.content,
            },
            page: {
              // Basic page info - in a real scenario you'd pass this from the UI
              url: '',
              title: '',
              content: '',
            },
          };

          // Process the user's message through the tool template
          const processedContent = template(context);

          console.log('[DEBUG] Tool template processing:', {
            tool: options.tool.name,
            originalContent: lastMessage.content,
            processedContent: processedContent,
            processedLength: processedContent.length,
            processedCharCodes: Array.from(processedContent).map(c => c.charCodeAt(0)),
          });

          // Replace the last user message with the processed version
          processedMessages[processedMessages.length - 1] = {
            ...lastMessage,
            content: processedContent,
          };

          console.log('Tool processing applied:', {
            tool: options.tool.name,
            original: lastMessage.content,
            processed: processedContent,
          });
        } catch (error) {
          console.error('Error processing tool template:', error);
          // Continue with original message if tool processing fails
        }
      }
    }

    if (options?.systemPrompt) {
      // Add system message at the beginning
      processedMessages = [{ role: 'system', content: options.systemPrompt }, ...processedMessages];
    }

    // Use the Vercel AI SDK's streamText function to handle everything
    const modelInstance = customProvider.chat(selectedModel.name); // Use selected model
    const result = await streamText({
      model: modelInstance,
      messages: processedMessages,
    });

    return result;
  } catch (error) {
    console.error('Error in streamChatResponse:', error);
    throw error; // Re-throw the error to be handled by the UI
  }
}
