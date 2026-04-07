import z from "zod";
import { APISuccessSchema } from "../../api/models/APISuccessResponse";
import { usernamePasswordSchema } from "./ILoginSchema";


export const UserAuthContextInfoSchema = APISuccessSchema.extend({
    userId: z.string().min(1, { message: "User ID is required" }),
    username: usernamePasswordSchema,
});

export type IUserAuthContextInfoSchema = z.infer<typeof UserAuthContextInfoSchema>;


//TRADEOFF WE MIGHT NEED TO USE THIS IN MANY CASES BUT INSTEAD OF RELYING ON AN AUTH CONTEXT IN THE UI
//WE MIGHT NEED TO SEND WHETHER THIS IS THE USER OR NOT CURRENTLY EACH TIME BECAUSE OTHERWISE
//WE HAVE TO HAVE OUR CHECKAUTH SEND US THE USERID AND USERNAME
//AND ALSO THE LOGIN/REGISTER ROUTE SEND BACK THE USERID AND SET IT IN THE AUTH

//THIS IS FINE SECURITY WISE BUT IF THE USER SOMEHOW CHANGES REFRESH TOKENS MID 
//SESSION THEN THE USER INFORMATION WILL REPRESENT THIS NEW USER
//BUT THE USER CONTEXT WILL REPRESENT THE PREVIOUS USER