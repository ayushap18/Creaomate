import { OpenAI } from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4-turbo';

// Initialize OpenAI client only if API key is present
const openai = apiKey ? new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true // Note: In production, calls should go through a backend
}) : null;

export const generateText = async (prompt: string): Promise<string> => {
  if (!openai) {
    console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in .env');
    return "OpenAI service not configured.";
  }

  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    });
    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error("Error generating text with OpenAI:", error);
    throw error;
  }
};
