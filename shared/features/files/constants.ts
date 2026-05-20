export const maxFileSizeInBytes = 50 * 1024 * 1024; // 50 MB

export const allowedImgTypes = [
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/gif",
];


export const allowedTextFileTypes = [
    "application/pdf",
    "text/plain",
    "application/msword",
];

export const allowedAllFileTypes = [
    ...allowedImgTypes,
    ...allowedTextFileTypes
];