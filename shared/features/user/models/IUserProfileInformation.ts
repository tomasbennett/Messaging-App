import z from "zod";
import { usernamePasswordRegex } from "../../auth/constants";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";




export const UserProfileInformationSchema = z.object({
    userId: z.string().min(1, { message: "User ID is required" }),
    username: usernamePasswordSchema,
    profileImgUrl: z.string().optional()
});


export type IUserProfileInformation = z.infer<typeof UserProfileInformationSchema>; 



export const ReceiveUserProfileInformationSchema = APISuccessSchema.merge(UserProfileInformationSchema);

export type IReceiveUserProfileInformation = z.infer<typeof ReceiveUserProfileInformationSchema>;