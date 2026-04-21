import { Router, NextFunction, Request, Response } from "express";
import { ensureJWTAuthentication } from "../auth/ensureJWTAuthentication";
import { ICustomErrorResponse } from "../../../shared/features/api/models/APIErrorResponse";
import { prisma } from "../db/prisma";


export const router = Router();



router.delete("/:friendId", ensureJWTAuthentication, async (req: Request<{ friendId: string }>, res: Response<ICustomErrorResponse>, next: NextFunction) => {
    const { friendId } = req.params;
    const user = req.user!;
    
    

    
    try {
        
        const deletedUser = await prisma.friendRequest.delete({
            where: {
                id: friendId
            }
        });


        //IF THERE EXISTS A FRIEND REQUEST THEN DELETE IT
        //IF THAT IS SUCCESSFUL THEN CHECK WHETHER THERE EXISTS A SHARED CONVERSATOIN HISTORY BETWEEN THEM AND DELETE THAT TOO???
        //IT CAN ONLY BE A CONVERSATION BETWEEN THEM TWO AND NOW WHEN CREATING GROUPS WE HAVE TO FIND A WAY TO ENSURE THAT THERE ARE MORE THAN TWO PEOPLE INVOLVED
        //WHAT IF WE JUST DON'T DELETE THEIR CONVERSATION HISTORY AND YOU CAN HAVE A CONVERATION





    } catch (error) {
        next(error);

    }
});