import { createUploadthing, type FileRouter } from "uploadthing/next";
import { auth } from "@clerk/nextjs/server";

const f = createUploadthing();

export const ourFileRouter = {
  // Define what kind of files we accept (Images up to 4MB)
  imageUploader: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    // Middleware runs BEFORE the upload starts to verify they are logged in
    .middleware(async () => {
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized to upload");
      return { userId };
    })
    // What to do when the file finishes uploading
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for user:", metadata.userId);
      console.log("File URL:", file.url);
      return { uploadedBy: metadata.userId, url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;