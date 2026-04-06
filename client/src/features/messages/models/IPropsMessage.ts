export type IPropsMessageComponent = {
    messageId: string;
    senderUsername?: string;
    timestamp: Date;

    content?: string;
    files?: { fileUrl: string; fileId: string }[];
};