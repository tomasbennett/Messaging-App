import { defaultUserColours } from "../constants/defaultUserColours";
import { IDefaultUserColours } from "../models/IDefaultUserColours";



export function getDefaultUserProfileColours(): IDefaultUserColours {
    const defArrCopy: string[] = [...defaultUserColours];

    const randomIndex = Math.floor(Math.random() * defaultUserColours.length);
    const bcgColour = defaultUserColours[randomIndex];

    defArrCopy.splice(randomIndex, 1);

    const randomIndexColour = Math.floor(Math.random() * defArrCopy.length);
    const colour = defArrCopy[randomIndexColour];

    return { bcgColour, colour };
}