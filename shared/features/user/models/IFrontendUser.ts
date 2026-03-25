import z from "zod";
import { BaseUserSchema } from "./IUser";
import { FileSingleOptionalSchema } from "../../files/models/INewOptionalFile";



export const ReceiveUserFrontendSchema = BaseUserSchema.extend({
    profilePictureUrl: z.string().optional()
});


export type IReceiveUserFrontend = z.infer<typeof ReceiveUserFrontendSchema>;


export const SendUserFrontendSchema = BaseUserSchema.extend({
    profilePictureFile: FileSingleOptionalSchema
});


export type ISendUserFrontend = z.infer<typeof SendUserFrontendSchema>;