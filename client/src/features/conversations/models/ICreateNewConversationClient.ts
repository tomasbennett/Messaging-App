import z from "zod";
import { CreateNewConversationSchema } from "../../../../../shared/features/conversation/models/ICreateNewConversation";

export const ClientNewConversation = CreateNewConversationSchema.omit({ participantIds: true });

export type IClientNewConversation = z.infer<typeof ClientNewConversation>;