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
        })
      )
      .mutation(async ({ input }) => {
        const { subjectId, message, language } = input;
        const subject = subjects[subjectId as keyof typeof subjects];

        if (!subject) {
          throw new Error("Subject not found");
        }

        // Get the appropriate system prompt based on language
        const systemPrompt =
          language === "ar" ? subject.systemPromptAr : subject.systemPromptEn;

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
          });

          // Extract the text content from the response
          const reply =
            response.choices?.[0]?.message?.content || "No response received";

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

