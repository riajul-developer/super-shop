import {
  object,
  string,
  number,
  optional,
  array,
  custom,
  pipe,
  InferOutput,
  transform,
  minValue,
} from 'valibot';
import { File } from '@nest-lab/fastify-multer';

const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 1 * 1024 * 1024; 

// Custom Image Validator
const isValidImage = custom<File>(
  (file: File) => {
    return (
      file &&
      typeof file === 'object' &&
      'mimetype' in file &&
      'size' in file &&
      allowedTypes.includes(file.mimetype) &&
      file.size <= MAX_FILE_SIZE
    );
  },
  (data) => {
    const file = data.input as File;
    if (!file || typeof file !== 'object') {
      return `Please upload a valid image file.`;
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return `Only JPEG, PNG, and WEBP are allowed.`;
    }

    if (file.size > MAX_FILE_SIZE) {
      return `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed size is 4MB.`;
    }
    return `Unknown validation error.`;
  }
);


export const createProductSchema = object({
  name: string(),
  categoryId: optional(number()),
  desc: optional(string()),
  regularPrice: optional(number()),
  sellPrice: pipe(
    string(),
    custom(
      (input) => !isNaN(Number(input)),
      'Expected number but received string',
    ),
    transform((input) => Number(input)),
    minValue(0, 'Sell price must be greater than or equal to 0'),
  ),
  stock: pipe(
    string(),
    custom(
      (input) => !isNaN(Number(input)),
      'Expected number but received string',
    ),
    transform((input) => Number(input)),
    minValue(0, 'Sell price must be greater than or equal to 0'),
  ),
  mainImage: optional(isValidImage),
  featureImages: array(isValidImage),
});

export type CreateProductType = InferOutput<typeof createProductSchema>;
