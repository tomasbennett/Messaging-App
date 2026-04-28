import z from "zod";
import { usernamePasswordSchema } from "../../auth/models/ILoginSchema";
import { USER_PROFILE_IMG_FILE_KEY } from "../../auth/constants";



export const UpdateProfileSchemaClientSide = z.object({
    username: usernamePasswordSchema.optional(),
    password: usernamePasswordSchema.optional(),
    [USER_PROFILE_IMG_FILE_KEY]: z.custom<FileList | undefined>()
}).superRefine((data, ctx) => {
    const hasUsername = !!data.username && data.username.trim() !== "";
    const hasPassword = !!data.password && data.password.trim() !== "";
    const hasProfileImgFile = !!data[USER_PROFILE_IMG_FILE_KEY] && data[USER_PROFILE_IMG_FILE_KEY] instanceof FileList && data[USER_PROFILE_IMG_FILE_KEY].length === 1;

    if (!hasUsername && !hasPassword && !hasProfileImgFile) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "At least one of the fields (username, password, profile image) must be provided for update",
        });
    }
    
    
});


export type IUpdateProfileClientSide = z.infer<typeof UpdateProfileSchemaClientSide>;


export const UpdateProfileSchemaServerSide = z.object({
    username: usernamePasswordSchema.optional(),
    password: usernamePasswordSchema.optional(),
});


export type IUpdateProfileServerSide = z.infer<typeof UpdateProfileSchemaServerSide>;



// export const UpdateProfileSchemaDatabaseSide = z.object({
//     username: usernamePasswordSchema.optional(),
//     password: usernamePasswordSchema.optional(),
//     [USER_PROFILE_IMG_FILE_KEY]: z.string().optional()
// }).superRefine((data, ctx) => {
//     const hasUsername = !!data.username && data.username.trim() !== "";
//     const hasPassword = !!data.password && data.password.trim() !== "";
//     const hasProfileImgUrl = !!data[USER_PROFILE_IMG_FILE_KEY] && data[USER_PROFILE_IMG_FILE_KEY].trim() !== "";

//     if (!hasUsername && !hasPassword && !hasProfileImgUrl) {
//         ctx.addIssue({
//             code: z.ZodIssueCode.custom,
//             message: "At least one of the fields (username, password, profile image ID) must be provided for update",
//         });
//     }
    
    
// });


// export type IUpdateProfileDatabaseSide = z.infer<typeof UpdateProfileSchemaDatabaseSide>;