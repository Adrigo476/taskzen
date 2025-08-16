// This file uses server-side code.
'use server';

/**
 * @fileOverview Provides AI mentorship for user objectives, offering personalized advice and motivation.
 *
 * - getAiMentorship - A function to retrieve AI-generated mentorship for user objectives.
 * - AiMentorshipInput - The input type for the getAiMentorship function.
 * - AiMentorshipOutput - The return type for the getAiMentorship function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiMentorshipInputSchema = z.object({
  objectives: z
    .string()
    .describe("The user's objectives, provided as a string."),
});
export type AiMentorshipInput = z.infer<typeof AiMentorshipInputSchema>;

const AiMentorshipOutputSchema = z.object({
  mentorship: z.string().describe('AI-generated advice and motivation for the user objectives.'),
});
export type AiMentorshipOutput = z.infer<typeof AiMentorshipOutputSchema>;

export async function getAiMentorship(input: AiMentorshipInput): Promise<AiMentorshipOutput> {
  return aiMentorshipFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiMentorshipPrompt',
  input: {schema: AiMentorshipInputSchema},
  output: {schema: AiMentorshipOutputSchema},
  prompt: `You are an AI mentor providing advice and motivation to the user based on their objectives.

  Objectives: {{{objectives}}}

  Provide personalized advice and motivation to help the user stay on track and achieve their goals. Focus on actionable strategies and positive reinforcement.`,
});

const aiMentorshipFlow = ai.defineFlow(
  {
    name: 'aiMentorshipFlow',
    inputSchema: AiMentorshipInputSchema,
    outputSchema: AiMentorshipOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
