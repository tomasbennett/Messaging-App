import { z } from "zod";

export const DateFromStringSchema = z
    .union([z.date(), z.string()])
    .transform((val, ctx) => {
        if (val instanceof Date) {
            return val;
        }

        const date = new Date(val);

        if (isNaN(date.getTime())) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid date string",
            });
            return z.NEVER;
        }

        return date;
    });
