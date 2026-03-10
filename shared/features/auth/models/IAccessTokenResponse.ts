import z from "zod";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";


export const AccessTokenResponseSchema = APISuccessSchema.extend({
    accessToken: z.string()
});


export type IAccessTokenResponse = z.infer<typeof AccessTokenResponseSchema>;