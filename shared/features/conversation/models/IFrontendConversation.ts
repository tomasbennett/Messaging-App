import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { FileSingleOptionalSchema } from "../../files/models/INewOptionalFile";




export const CreateConversationFrontendSchema = BaseConversationSchema.extend({
    groupChatProfilePictureFile: FileSingleOptionalSchema
});


export type ICreateConversationFrontend = z.infer<typeof CreateConversationFrontendSchema>;


export const ReceiveConversationFrontendSchema = BaseConversationSchema.extend({
    groupChatProfilePictureUrl: z.string().optional()
});


export type IReceiveConversationFrontend = z.infer<typeof ReceiveConversationFrontendSchema>;