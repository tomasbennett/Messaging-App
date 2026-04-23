import z from "zod";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";
import { ReceiveUserFrontendSchema } from "../../user/models/IFrontendUser";
import { FriendRequestStatusValues } from "../constants";



export const BaseFriendRequestSchema = z.object({
    requestId: z.string().min(1, { message: "Request ID is required" }),
    sender: ReceiveUserFrontendSchema.pick({
        userId: true,
        username: true,
        profilePictureUrl: true,
    }),
    receiver: ReceiveUserFrontendSchema.pick({
        userId: true,
    }),
    status: z.enum(FriendRequestStatusValues),
    createdAt: DateFromStringSchema,
    updatedAt: DateFromStringSchema
});

export type IBaseFriendRequest = z.infer<typeof BaseFriendRequestSchema>;   