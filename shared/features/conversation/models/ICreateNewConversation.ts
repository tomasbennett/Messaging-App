import z from "zod";
import { BaseConversationSchema } from "./IBaseConversation";
import { CONVERSATION_CUSTOM_IMAGE_FILE_KEY } from "../constants";
import { FileSingleOptionalSchema } from "../../files/models/INewOptionalFile";
import { allowedImgTypes, maxFileSizeInBytes } from "../../files/constants";



export const CreateNewConversationSchema = z.object({
    name: BaseConversationSchema.shape.name,
    participantIds: z.array(z.string()),
    [CONVERSATION_CUSTOM_IMAGE_FILE_KEY]: FileSingleOptionalSchema(allowedImgTypes, maxFileSizeInBytes)
});


export type ICreateNewConversation = z.infer<typeof CreateNewConversationSchema>;