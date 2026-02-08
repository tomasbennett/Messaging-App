import { environment } from "../../../shared/constants";

export const domain: string = environment === "PROD" ? "" : "http://localhost:3000";