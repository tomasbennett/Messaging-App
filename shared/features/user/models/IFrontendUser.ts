import z from "zod";
import { BaseUserSchema } from "./IUser";
import { FileSingleOptionalSchema } from "../../files/models/INewOptionalFile";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";



export const ReceiveUserFrontendSchema = BaseUserSchema.extend({
    profilePictureUrl: z.string().optional(),
    createdAccountAt: DateFromStringSchema
});


export type IReceiveUserFrontend = z.infer<typeof ReceiveUserFrontendSchema>;


export const SendUserFrontendSchema = BaseUserSchema
.pick({
    username: true,
    password: true,
})
.extend({
    profilePictureFile: FileSingleOptionalSchema
});


export type ISendUserFrontend = z.infer<typeof SendUserFrontendSchema>;