import {
  object,
  string,
  number,
  optional,
  custom,
  InferOutput,
  pipe,
  transform,
  minValue,
  rawTransform,
  nonEmpty,
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
      return `File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Max allowed size is 1MB.`;
    }
    return `Unknown validation error.`;
  },
);

export const createCategorySchema = pipe(
  object({
    name: pipe(
      string(),
      nonEmpty('Name cannot be empty.'), // Empty string validation
    ),
    parentId: pipe(
      optional(string()),
      string(),
      custom(
        (input) => !isNaN(Number(input)),
        'Expected number but received string',
      ),
      transform((input) => Number(input)),
      minValue(0, 'Parent id must be greater than or equal to 0'),
    ),
    image: optional(isValidImage),
  }),
  rawTransform(({ dataset, addIssue }) => {
    if (!dataset.value.parentId && !dataset.value.image) {
      addIssue({
        message: 'Image is required.',
        path: [
          {
            type: 'object',
            origin: 'value',
            input: dataset.value,
            key: 'image',
            value: dataset.value.image,
          },
        ],
      });
    }

    if (dataset.value.parentId && dataset.value.image) {
      addIssue({
        message: 'Image should not be provided.',
        path: [
          {
            type: 'object',
            origin: 'value',
            input: dataset.value,
            key: 'image',
            value: dataset.value.image,
          },
        ],
      });
    }

    return dataset.value;
  }),
);

export const updateCategorySchema = object({
  name: optional(string()),
  parentId: optional(number()),
  image: optional(isValidImage),
});

export type CreateCategoryType = InferOutput<typeof createCategorySchema>;
export type UpdateCategoryType = InferOutput<typeof updateCategorySchema>;
