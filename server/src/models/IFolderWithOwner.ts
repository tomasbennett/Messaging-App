import { Prisma } from "@prisma/client"

export type IFolderWithOwner = Prisma.FolderGetPayload<{
    include: {

        owner: true
    }
}>