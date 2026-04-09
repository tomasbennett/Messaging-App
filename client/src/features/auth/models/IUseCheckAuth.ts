import { IUserAuthContextInfoSchema } from "../../../../../shared/features/auth/models/ILoginSuccessUserInfo";

export type IAuthLevel = 
    | { userType: "none"}
    | ({ userType: "user" } & IUserAuthContextInfoSchema);



export type IAuthContextType = {
    authLevel: IAuthLevel;
    setAuthLevel: React.Dispatch<React.SetStateAction<IAuthLevel>>;
}