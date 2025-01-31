import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { safeParse } from 'valibot';

@Injectable()
export default class ValibotValidationPipe implements PipeTransform {
  constructor(private readonly schema: any) {} 

  transform(value: any) {
    const result = safeParse(this.schema, value);

    if (!result.success) {
      const errors = result.issues.map((issue) => ({
        field: issue.path[0].key as string, 
        message: issue.message, 
      }));

      throw new BadRequestException({
        status: 'error',
        message: 'Validation failed',
        data: null,
        errors,
      });
    }

    return result.output; 
  }
}
