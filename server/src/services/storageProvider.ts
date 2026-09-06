import fs from 'fs';
import path from 'path';

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export class StorageProvider {
  /**
   * Saves a base64 snapshot image and returns a web-accessible URL
   */
  public async saveSnapshot(resultId: string, base64Data: string): Promise<string> {
    try {
      if (!base64Data || !base64Data.startsWith('data:image')) {
        return base64Data; // Already a URL or empty
      }

      // Extract base64 payload
      const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches || matches.length < 3) {
        return base64Data;
      }

      const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      const filename = `snapshot_${resultId}_${Date.now()}.${ext}`;
      const filePath = path.join(UPLOAD_DIR, filename);

      await fs.promises.writeFile(filePath, buffer);

      // Return server-relative URL
      return `/uploads/${filename}`;
    } catch (err) {
      console.warn('Storage save failed, using direct data URI fallback:', err);
      return base64Data;
    }
  }

  /**
   * Cleans up temporary uploads directory
   */
  public async clearTemporarySnapshots(): Promise<number> {
    try {
      const files = await fs.promises.readdir(UPLOAD_DIR);
      let count = 0;
      for (const file of files) {
        await fs.promises.unlink(path.join(UPLOAD_DIR, file));
        count++;
      }
      return count;
    } catch {
      return 0;
    }
  }
}

export const storageProvider = new StorageProvider();
