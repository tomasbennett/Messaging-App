/*
  Warnings:

  - You are about to drop the `FriendRequest` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "InviteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "FriendRequest" DROP CONSTRAINT "FriendRequest_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "hasLeft" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "FriendRequest";

-- CreateTable
CREATE TABLE "ConversationJoinRequest" (
    "id" UUID NOT NULL,
    "senderParticipantId" UUID NOT NULL,
    "receiverId" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "status" "InviteStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationJoinRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConversationJoinRequest" ADD CONSTRAINT "ConversationJoinRequest_senderParticipantId_fkey" FOREIGN KEY ("senderParticipantId") REFERENCES "ConversationParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationJoinRequest" ADD CONSTRAINT "ConversationJoinRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationJoinRequest" ADD CONSTRAINT "ConversationJoinRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "ConversationParticipant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
