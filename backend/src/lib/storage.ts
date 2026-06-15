import { getStorage } from 'firebase-admin/storage';
import fs from 'fs';
import path from 'path';
import os from 'os';

/**
 * Uploads a file buffer to Firebase Storage.
 * Falls back to saving locally in the 'uploads/' folder if Firebase config fails.
 */
export const uploadFileToFirebase = async (
  fileBuffer: Buffer,
  originalName: string,
  mimetype: string,
  folder: string,
  userId: string
): Promise<string> => {
  try {
    const bucketName = 'edworld-career-os-2026.firebasestorage.app';
    const bucket = getStorage().bucket(bucketName);
    const ext = path.extname(originalName);
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const uniqueName = `${folder}/${userId}_${Date.now()}_${cleanName}`;
    
    const blob = bucket.file(uniqueName);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: mimetype
      }
    });

    const publicUrl = await new Promise<string>((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', async () => {
        try {
          // Generate a signed read URL valid until the year 2500
          const [url] = await blob.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });
          resolve(url);
        } catch (err) {
          reject(err);
        }
      });

      blobStream.end(fileBuffer);
    });

    return publicUrl;
  } catch (error: any) {
    console.warn('Firebase storage upload failed, falling back to local file write:', error.message);
    
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${userId}_${Date.now()}_${cleanName}`;
    
    const isVercel = process.env.VERCEL || process.env.NOW_BUILDER;
    const localDir = isVercel
      ? path.join(os.tmpdir(), 'uploads', folder)
      : path.join(process.cwd(), 'uploads', folder);

    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localPath = path.join(localDir, fileName);
    fs.writeFileSync(localPath, fileBuffer);
    return `/uploads/${folder}/${fileName}`;
  }
};
