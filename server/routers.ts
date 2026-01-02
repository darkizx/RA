import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import { subjects } from "../client/src/lib/subjects";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  ai: router({
    chat: publicProcedure
      .input(
        z.object({
          subjectId: z.string(),
          message: z.string(),
          language: z.enum(["ar", "en"]),
          concise: z.boolean().optional().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const { subjectId, message, language, concise } = input;
        const subject = subjects[subjectId as keyof typeof subjects];

        if (!subject) {
          throw new Error("Subject not found");
        }

        // Get the appropriate system prompt based on language
        let systemPrompt =
          language === "ar" ? subject.systemPromptAr : subject.systemPromptEn;
        
        // Add concise mode instruction if requested
        if (concise) {
          const conciseInstruction = language === "ar" 
            ? "\n\nأجب بإجابة مختصرة جداً (جملة أو جملتين فقط). اذكر الإجابة مباشرة بدون شرح طويل."
            : "\n\nRespond with a very brief answer (1-2 sentences only). Give the direct answer without lengthy explanation.";
          systemPrompt += conciseInstruction;
        }

        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: systemPrompt,
              },
              {
                role: "user",
                content: message,
              },
            ],
            concise: concise,
          });

          // Extract the text content from the response
          let reply = response.content || "No response received";
          
          // Ensure concise mode returns short responses
          if (concise && typeof reply === "string" && reply.length > 300) {
            reply = reply.substring(0, 300).trim() + "...";
          }

          return {
            reply: typeof reply === "string" ? reply : JSON.stringify(reply),
            success: true,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error("Error calling Gemini API:", errorMessage);
          throw new Error(`Failed to get AI response: ${errorMessage}`);
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;

