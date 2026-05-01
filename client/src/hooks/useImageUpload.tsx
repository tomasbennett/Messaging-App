import { useEffect, useState } from "react";
import { FileSingleSchema } from "../../../shared/features/files/models/INewFile";
import { allowedImgTypes, maxFileSizeInBytes } from "../../../shared/features/files/constants";
import { useError } from "../features/error/contexts/ErrorContext";

export function useImageUpload() {

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const errorCtx = useError();

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {

        const selectedFile = e.target?.files;
        if (!selectedFile) return;

        const imgResult = FileSingleSchema(allowedImgTypes, maxFileSizeInBytes).safeParse(selectedFile);
        if (!imgResult.success) {
            const errorMessage = imgResult.error.issues.map(issue => issue.message).join("\n");
            errorCtx?.throwError({
                ok: false,
                status: 400,
                message: errorMessage,
            });
            return;
        }

        const previewUrl = URL.createObjectURL(selectedFile[0]);
        setPreview(previewUrl);


        setFile(selectedFile[0]);
    }


    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);


    return {
        file,
        preview,
        handleFileChange,
    }

}