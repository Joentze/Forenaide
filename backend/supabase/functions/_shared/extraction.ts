import { google } from "npm:@ai-sdk/google";
import { anthropic } from "npm:@ai-sdk/anthropic";
import { LanguageModel } from "npm:ai";

const LLMProviderMap: Record<string, LanguageModel> = {
    "gemini:pdf": google("gemini-1.5-flash"),
    "claude:pdf": anthropic("claude-3-5-sonnet-latest"),
};

export { LLMProviderMap };
