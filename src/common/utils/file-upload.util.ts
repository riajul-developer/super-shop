import { extname } from 'path';
import { promises as fs } from 'fs';
import { File } from '@nest-lab/fastify-multer';


export async function saveFile(uploadDir: string, file: File): Promise<string> {
  try {
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extname(file.originalname)}`;
    const filePath = `${uploadDir}/${uniqueFilename}`;

    await fs.writeFile(filePath, file.buffer);

    return filePath; 
  } catch (error) {
    throw new Error('File upload failed');
  }
}
