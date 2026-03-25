import z from "zod";
import { SendUserFrontendSchema } from "./IFrontendUser";
import { DateFromStringSchema } from "../../util/models/IDateFromStringSchema";



export const ReceiveUserBackendSchema = SendUserFrontendSchema.extend({
    createdAt: DateFromStringSchema,
});