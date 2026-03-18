import { supabase } from "../supabase/client";

export async function GenerateSupabasePublicURL(
    supabaseFileIds: string[]
): Promise< 
    | { supabasePublicURLs: string[]; ok: true; } 
    | { ok: false; error: string; }
> {
    const bucketName = process.env.SUPABASE_BUCKET_NAME || "uploads";
    const generateLinkExpiration: number = 60 * 5;

    try {
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .createSignedUrls(
                supabaseFileIds,
                generateLinkExpiration
            );

        if (error || !data) {
            return {
                ok: false,
                error: "Error generating signed URLs from Supabase storage: " + (error?.message || "Unknown error")
            }
        }

        const failed = data.find(item => item.error);

        if (failed) {
            return {
                ok: false,
                error: failed.error || "Failed generating one or more signed URLs"
            };
        }


        return {
            supabasePublicURLs: data.map(item => item.signedUrl),
            ok: true
        };

    } catch (error) {
        console.error("Error generating Supabase public URL:", error);
        return {
            ok: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };

    }
}