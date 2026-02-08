import { z } from "zod";

export const NumberFromStringSchema = z
    .union([z.number(), z.string()])
    .transform((val, ctx) => {
        if (typeof val === "number") {
            return val;
        }

        const num = Number(val);

        if (isNaN(num)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Invalid number string",
            });
            return z.NEVER;
        }

        return num;
    });
