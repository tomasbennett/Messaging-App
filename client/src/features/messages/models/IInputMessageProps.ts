import { IConversationMessage } from "../../../../../shared/features/message/models/IConversationMessage";
import { IMessageContentFile } from "../../../../../shared/features/message/models/IMessageContent";




export type IInputMessageComponentProps = {
    conversationId: string;
    onMessageSent: (message: IConversationMessage) => void | Promise<void>;
}



export type IInputMessageErrors = ({
    [T in keyof IMessageContentFile]: string | undefined;
} & {
    root: string | undefined;
});

