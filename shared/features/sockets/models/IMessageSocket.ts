import z from "zod";
import { SendMessageFrontendSchema } from "../../message/models/IFrontendMessages";
import { BaseSocketEmitData, BaseSocketUserReqData } from "./IBaseSocketReqData";
import { BaseMessageSchema } from "../../message/models/IBaseMessage";
import { MessageContentURLSchema } from "../../message/models/IMessageContent";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";



export const MessageSendSocketSchema = SendMessageFrontendSchema
.merge(BaseSocketEmitData);



export type IMessageSendSocketData = z.infer<typeof MessageSendSocketSchema>;


export const MessageSuccessUploadSocketSchema = APISuccessSchema.extend({
    messageId: z.string(),
});


export type IMessageSuccessUploadSocketData = z.infer<typeof MessageSuccessUploadSocketSchema>;