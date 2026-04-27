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



export function NumberFromStringMinMaxLimitSchemaFunc(min: number, max: number) {
    return z
        .union([z.number(), z.string()])
        .transform((val, ctx) => {
            const num =
                typeof val === "number"
                    ? val
                    : Number(val);

            if (Number.isNaN(num)) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message: "Invalid number string"
                });

                return z.NEVER;
            }

            if (
                num < min
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    minimum: min,
                    inclusive: true,
                    type: "number",
                    message: `Must be at least ${min}`
                });

                return z.NEVER;
            }

            if (
                num > max
            ) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    maximum: max,
                    inclusive: true,
                    type: "number",
                    message: `Must be at most ${max}`
                });

                return z.NEVER;
            }

            return num;
        });
}