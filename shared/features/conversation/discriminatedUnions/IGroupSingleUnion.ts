import z from "zod";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";




export const ConversationGroupSingleUnionSchema = z.union([z.literal("one_to_one"), z.literal("group")]);


export type IConversationGroupSingleUnion = z.infer<typeof ConversationGroupSingleUnionSchema>;