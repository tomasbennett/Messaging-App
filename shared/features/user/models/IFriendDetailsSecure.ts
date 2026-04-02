import z from "zod";
import { BaseUserSchema } from "./IUser";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";



export const FriendDetailsSecureSchema = BaseUserSchema.extend({
    profilePictureUrl: z.string().optional()
});