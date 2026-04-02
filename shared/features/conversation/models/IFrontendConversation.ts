import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { FileSingleOptionalSchema } from "../../files/models/INewOptionalFile";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { GroupProfileUnionSchema } from "../discriminatedUnions/IGroupProfileUnion";




export const CreateConversationFrontendSchema = BaseConversationSchema
.pick({
    name: true,
    participants: true,
})
.extend({
    groupChatProfilePictureFile: FileSingleOptionalSchema
});


export type ICreateConversationFrontend = z.infer<typeof CreateConversationFrontendSchema>;


export const ReceiveConversationFrontendSchema = BaseConversationSchema.extend({
    groupChatProfilePicture: GroupProfileUnionSchema,
    createdAt: DateFromStringSchema
});


export type IReceiveConversationFrontend = z.infer<typeof ReceiveConversationFrontendSchema>;