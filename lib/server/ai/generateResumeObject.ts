import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ResumeDataSchema } from '@/lib/resume';

const model = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-flash",
  maxOutputTokens: 2048,
  apiKey: process.env.GEMINI_API_KEY,
});

const structuredLlm = model.withStructuredOutput(ResumeDataSchema, {
  includeRaw: true,
  name: "summarySchema",
});

export const generateResumeObject = async (resumeText: string) => {
  const startTime = Date.now();
  try {
    const structuredResult = await structuredLlm.invoke(resumeText);

    console.log(structuredResult.parsed)

    const endTime = Date.now();
    console.log(
      `Generating resume object took ${(endTime - startTime) / 1000} seconds`
    );

    return structuredResult.parsed;
  } catch (error) {
    console.warn('Impossible generating resume object', error);
    return undefined;
  }
};
