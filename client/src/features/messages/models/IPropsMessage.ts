import { IConversationGroupSingleUnion } from "../../../../../shared/features/conversation/discriminatedUnions/IGroupSingleUnion";
import { IConversationMessage } from "../../../../../shared/features/message/models/IConversationMessage";

export type IPropsMessageComponent = IConversationMessage & {
    conversationGroupType: IConversationGroupSingleUnion
};