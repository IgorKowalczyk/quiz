import { z } from "zod";

export const quizId = z.union([
 z.string().regex(/^\d{6}$/),
 z.number().refine((val) => /^\d{6}$/.test(val.toString()), {
  message: "Number must be exactly 6 digits long",
 }),
]);

export const quiz = z.object({
 name: z.string({ message: "Name is required!" }).min(1, { message: "Name is required!" }),
 questions: z.array(
  z.object({
   id: z.string(),
   question: z.string(),
   options: z
    .array(
     z.object({
      option: z.string({ message: "Option is required!" }).min(1, { message: "Option is required!" }),
      correct: z.boolean({ message: "A correct flag is required!" }),
     })
    )
    .min(2, { message: "At least two options are required!" })
    .max(20, { message: "At most 20 options are allowed!" })
    .refine((options) => options.some((option) => option.correct), {
     message: "At least one option must be marked as correct!",
    }),
  }),
  { message: "At least one question is required!" }
 ),
});

export const createdQuiz = z.object({
 ...quiz.shape,
 auth: z.string().uuid(),
 id: quizId,
 started: z.boolean().default(false),
 ended: z.boolean().default(false),
 isOnAnswer: z.boolean().default(false),
 currentQuestion: z.number().default(0),
});

export const userNameSchema = z.object({
 username: z.string().min(1, "Username is required").max(36, "Username must be less than 36 characters"),
});

export const userIdSchema = z.string().uuid();
export const authSchema = z.string().uuid();

export const quizMemberSchema = z.object({
 userId: userIdSchema,
 username: z.string(),
 score: z.number(),
 kicked: z.boolean(),
 hasSubmitted: z.boolean(),
 newScore: z.number().default(0),
 goodAnswer: z.boolean().default(false),
 color: z.string().regex(/^hsl\(\d{1,3}, 50%, 50%\)$/),
});

export const joinOrRejoinQuiz = z.object({
 userId: userIdSchema.optional(),
 quizId,
 username: z.string().optional(),
});

export const kickMember = z.object({
 quizId,
 userId: userIdSchema,
 auth: authSchema,
});

export type CreatedQuiz = z.infer<typeof createdQuiz>;
export type Quiz = z.infer<typeof quiz>;

export type JoinOrRejoinQuiz = z.infer<typeof joinOrRejoinQuiz>;
export type KickMember = z.infer<typeof kickMember>;

export type UserId = z.infer<typeof userIdSchema>;
export type Auth = z.infer<typeof authSchema>;

export type UserName = z.infer<typeof userNameSchema>;

export type QuizMember = z.infer<typeof quizMemberSchema>;
