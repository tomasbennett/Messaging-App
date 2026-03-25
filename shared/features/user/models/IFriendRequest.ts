import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { ReceiveUserFrontendSchema } from "./IFrontendUser";



export const FriendRequestSchema = z.object({
    requestId: z.string(),
    sender: ReceiveUserFrontendSchema.pick({
        userId: true,
        username: true,
        profilePictureUrl: true,
    }),
    receiver: ReceiveUserFrontendSchema.pick({
        userId: true,
    }),
    status: z.enum(["pending", "accepted", "rejected"]),
    createdAt: DateFromStringSchema,
    updatedAt: DateFromStringSchema
});

export type IFriendRequest = z.infer<typeof FriendRequestSchema>;   