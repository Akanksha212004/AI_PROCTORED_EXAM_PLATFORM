// import { z } from "zod";
// import { DifficultyLevel, GazeSensitivity, QuestionType, RandomizationMode } from "@prisma/client";
 
// const selectionRuleSchema = z.object({
//   subject: z.string().trim().min(1).optional(),
//   questionType: z.nativeEnum(QuestionType).optional(),
//   difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
//   count: z.number().int().positive("count must be a positive integer"),
// });
 
// const examBaseSchema = z.object({
//   title: z.string().trim().min(1, "title is required"),
//   subject: z.string().trim().min(1, "subject is required"),
//   durationMinutes: z.number().int().positive("durationMinutes must be a positive integer"),
//   startTime: z.coerce.date(),
//   endTime: z.coerce.date(),
//   randomizationMode: z.nativeEnum(RandomizationMode).default(RandomizationMode.PER_STUDENT_UNIQUE),
//   negativeMarkingEnabled: z.boolean().default(true),
//   webcamMonitoringEnabled: z.boolean().default(true),
//   multiFaceDetectionEnabled: z.boolean().default(true),
//   fullScreenModeEnabled: z.boolean().default(true),
//   gazeSensitivity: z.nativeEnum(GazeSensitivity).default(GazeSensitivity.MEDIUM),
//   maxTabSwitchWarnings: z.number().int().positive().default(3),
//   selectionRules: z.array(selectionRuleSchema).optional(),
//   questionIds: z.array(z.string().min(1)).optional(),
// });
 
// function applyExamRules(data: z.infer<typeof examBaseSchema>, ctx: z.RefinementCtx) {
//   if (data.endTime <= data.startTime) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["endTime"],
//       message: "endTime must be after startTime",
//     });
//   }
// }
 
// export const createExamSchema = examBaseSchema.superRefine(applyExamRules);
// export const updateExamSchema = examBaseSchema.superRefine(applyExamRules);
 
// export const listExamsQuerySchema = z.object({
//   subject: z.string().trim().optional(),
//   page: z.coerce.number().int().positive().default(1),
//   limit: z.coerce.number().int().positive().max(100).default(20),
// });
 
// export const addPoolQuestionsSchema = z.object({
//   questionIds: z.array(z.string().min(1)).min(1, "at least one questionId is required"),
// });
 
// export type CreateExamInput = z.infer<typeof createExamSchema>;
// export type UpdateExamInput = z.infer<typeof updateExamSchema>;
// export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;
// export type AddPoolQuestionsInput = z.infer<typeof addPoolQuestionsSchema>;






// // src/schemas/exam.schema.ts

// import { z } from "zod";
// import { DifficultyLevel, GazeSensitivity, QuestionType, RandomizationMode } from "@prisma/client";

// const selectionRuleSchema = z.object({
//   subject: z.string().trim().min(1).optional(),
//   questionType: z.nativeEnum(QuestionType).optional(),
//   difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
//   count: z.number().int().positive("count must be a positive integer"),
// });

// const examBaseSchema = z.object({
//   title: z.string().trim().min(1, "title is required"),
//   subject: z.string().trim().min(1, "subject is required"),
//   durationMinutes: z.number().int().positive("durationMinutes must be a positive integer"),
//   startTime: z.coerce.date(),
//   endTime: z.coerce.date(),
//   randomizationMode: z.nativeEnum(RandomizationMode).default(RandomizationMode.PER_STUDENT_UNIQUE),
//   negativeMarkingEnabled: z.boolean().default(true),
//   webcamMonitoringEnabled: z.boolean().default(true),
//   multiFaceDetectionEnabled: z.boolean().default(true),
//   fullScreenModeEnabled: z.boolean().default(true),
//   // UI-only setting — no audio pipeline exists yet (see schema comment).
//   audioMonitoringEnabled: z.boolean().default(false),
//   gazeSensitivity: z.nativeEnum(GazeSensitivity).default(GazeSensitivity.MEDIUM),
//   maxTabSwitchWarnings: z.number().int().positive().default(3),
//   selectionRules: z.array(selectionRuleSchema).optional(),
//   questionIds: z.array(z.string().min(1)).optional(),
// });

// function applyExamRules(data: z.infer<typeof examBaseSchema>, ctx: z.RefinementCtx) {
//   if (data.endTime <= data.startTime) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       path: ["endTime"],
//       message: "endTime must be after startTime",
//     });
//   }
// }

// export const createExamSchema = examBaseSchema.superRefine(applyExamRules);
// export const updateExamSchema = examBaseSchema.superRefine(applyExamRules);

// export const listExamsQuerySchema = z.object({
//   subject: z.string().trim().optional(),
//   page: z.coerce.number().int().positive().default(1),
//   limit: z.coerce.number().int().positive().max(100).default(20),
// });

// export const addPoolQuestionsSchema = z.object({
//   questionIds: z.array(z.string().min(1)).min(1, "at least one questionId is required"),
// });

// export type CreateExamInput = z.infer<typeof createExamSchema>;
// export type UpdateExamInput = z.infer<typeof updateExamSchema>;
// export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;
// export type AddPoolQuestionsInput = z.infer<typeof addPoolQuestionsSchema>;







import { z } from "zod";
import { DifficultyLevel, ExamStatus, GazeSensitivity, QuestionType, RandomizationMode } from "@prisma/client";
 
const selectionRuleSchema = z.object({
  subject: z.string().trim().min(1).optional(),
  questionType: z.nativeEnum(QuestionType).optional(),
  difficultyLevel: z.nativeEnum(DifficultyLevel).optional(),
  count: z.number().int().positive("count must be a positive integer"),
});
 
const examBaseSchema = z.object({
  title: z.string().trim().min(1, "title is required"),
  subject: z.string().trim().min(1, "subject is required"),
  durationMinutes: z.number().int().positive("durationMinutes must be a positive integer"),
  totalMarks: z.number().int().positive("totalMarks must be a positive integer"),
  passingMarks: z.number().int().min(0, "passingMarks cannot be negative"),
  status: z.nativeEnum(ExamStatus).default(ExamStatus.DRAFT),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  randomizationMode: z.nativeEnum(RandomizationMode).default(RandomizationMode.PER_STUDENT_UNIQUE),
  negativeMarkingEnabled: z.boolean().default(true),
  webcamMonitoringEnabled: z.boolean().default(true),
  multiFaceDetectionEnabled: z.boolean().default(true),
  fullScreenModeEnabled: z.boolean().default(true),
  audioMonitoringEnabled: z.boolean().default(false),
  gazeSensitivity: z.nativeEnum(GazeSensitivity).default(GazeSensitivity.MEDIUM),
  maxTabSwitchWarnings: z.number().int().positive().default(3),
  selectionRules: z.array(selectionRuleSchema).optional(),
  questionIds: z.array(z.string().min(1)).optional(),
});
 
function applyExamRules(data: z.infer<typeof examBaseSchema>, ctx: z.RefinementCtx) {
  if (data.endTime <= data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["endTime"],
      message: "endTime must be after startTime",
    });
  }
  if (data.passingMarks > data.totalMarks) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["passingMarks"],
      message: "passingMarks cannot exceed totalMarks",
    });
  }
}
 
export const createExamSchema = examBaseSchema.superRefine(applyExamRules);
export const updateExamSchema = examBaseSchema.superRefine(applyExamRules);
 
export const listExamsQuerySchema = z.object({
  subject: z.string().trim().optional(),
  status: z.nativeEnum(ExamStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
 
export const addPoolQuestionsSchema = z.object({
  questionIds: z.array(z.string().min(1)).min(1, "at least one questionId is required"),
});
 
export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;
export type ListExamsQuery = z.infer<typeof listExamsQuerySchema>;
export type AddPoolQuestionsInput = z.infer<typeof addPoolQuestionsSchema>;
