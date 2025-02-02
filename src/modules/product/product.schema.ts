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
  minValue
} from 'valibot';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit

// Custom validator for file validation with separate error messages
const imageFile = custom<File>(
  (file) => {
    if (!(file instanceof File)) return false; // File is required
    if (!/image\/(jpeg|png)/.test(file.type)) return false; // Invalid type
    if (file.size > MAX_FILE_SIZE) return false; // File too large
    return true; // Validation successful
  },
  (file) => {
    if (!(file instanceof File)) return 'File is required';
    if (!/image\/(jpeg|png)/.test(file.type))
      return 'Only JPG and PNG files are allowed';
    if (file.size > MAX_FILE_SIZE)
      return `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    return ''; // No error
  },
);

export const productSchema = object({
  name: string(),
  categoryId: optional(number()),
  desc: optional(string()),
  regularPrice: optional(number()),
  sellPrice: pipe(
    string(),
    custom((input) => !isNaN(Number(input)), "Invalid type: Expected number but received string"),
    transform((input) => Number(input)),
    minValue(0, "Sell price must be greater than or equal to 0")
  ),
  stock: pipe(
    string(),
    custom((input) => !isNaN(Number(input)), "Invalid type: Expected number but received string"),
    transform((input) => Number(input)),
    minValue(0, "Sell price must be greater than or equal to 0")
  ),
});

// export const productSchema = pipe(
//   object({
//     name: string(),
//     categoryId: optional(number()),
//     desc: optional(string()),
//     regularPrice: optional(number()),
//     sellPrice: string(),
//     stock: string(),
//   }),

// );

export type ProductDataType = InferOutput<typeof productSchema>;
