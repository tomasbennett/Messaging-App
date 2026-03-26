import { set } from "zod";
import { IFriendPreviewMessages } from "../../../../../shared/features/conversation/models/IFriendPreviewMessages"

export type IFriendMessagesContext = {
    friendMessages: IFriendPreviewMessages[];
    setFriendMessages: React.Dispatch<React.SetStateAction<IFriendPreviewMessages[]>>;
    isLoading: boolean;
}