import { useState } from "react";
import { ExcelDataRow, UploadMessage } from "./types";

export function useDatabaseUpload() {
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<UploadMessage | null>(
        null
    );

    const uploadToDatabase = async (
        excelData: ExcelDataRow[],
        collectionName: string
    ) => {
        if (!collectionName.trim()) {
            setUploadMessage({
                type: "error",
                text: "✗ Please enter a collection name",
            });
            return;
        }

        setUploading(true);
        setUploadMessage(null);

        try {
            // Call Express server instead of Next.js API route
            const response = await fetch("http://localhost:4000/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: excelData,
                    collectionName: collectionName.trim(),
                }),
            });

            const result = await response.json();

            if (response.ok) {
                setUploadMessage({
                    type: "success",
                    text: `✓ ${result.message}`,
                });
                setTimeout(() => setUploadMessage(null), 3000);
            } else {
                setUploadMessage({
                    type: "error",
                    text: `✗ ${result.error}`,
                });
            }
        } catch (error) {
            setUploadMessage({
                type: "error",
                text: `✗ Failed to upload: ${error instanceof Error ? error.message : "Unknown error"
                    }`,
            });
        } finally {
            setUploading(false);
        }
    };

    return {
        uploading,
        uploadMessage,
        uploadToDatabase,
    };
}
