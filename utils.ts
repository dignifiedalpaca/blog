import { expandGlob } from "@std/fs";

export function getMimeType(filename: string): string {
    const mimeTypes: { [key: string]: string } = {
        ".txt": "text/plain",
        ".html": "text/html",
        ".css": "text/css",
        ".js": "application/javascript",
        ".json": "application/json",
        ".png": "image/png",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".pdf": "application/pdf",
        ".xml": "application/xml",
        ".zip": "application/zip",
        ".mp3": "audio/mpeg",
        ".mp4": "video/mp4",
        // Add more as needed
    };

    const ext: string = filename.substring(filename.lastIndexOf("."))
        .toLowerCase();

    return mimeTypes[ext] || "application/octet-stream"; // Default to binary stream if not found
}

export async function isDirectoryEmpty(dirPath: string): Promise<boolean> {
    for await (const _ of expandGlob(`${dirPath}/*`)) {
        return false;
    }
    return true;
}
