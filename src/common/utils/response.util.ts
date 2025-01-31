import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';

export function createResponse(
  status: 'success' | 'error',
  message: string,
  data: any = null,
  errors: any = null,
) {
  return { status, message, data, errors };
}

export function badErrorResponse(message?: string, errors: any = null) {
  const errorMessage = message?.trim() ? message : 'Validation failed';
  throw new BadRequestException(
    createResponse('error', errorMessage, null, errors),
  );
}

export function serverErrorResponse(message = 'Something went wrong') {
  throw new InternalServerErrorException(createResponse('error', message));
}

export function notFoundResponse(message = 'Resource not found') {
  throw new NotFoundException(createResponse('error', message));
}

export function forbiddenResponse(message = 'Access denied') {
  throw new ForbiddenException(createResponse('error', message));
}

export function unauthorizedResponse(message = 'Unauthorized access') {
  throw new UnauthorizedException(createResponse('error', message));
}

export function conflictResponse(message?: string, errors: any = null) {
  const errorMessage = message?.trim() ? message : 'Conflict detected';
  throw new ConflictException(
    createResponse('error', errorMessage, null, errors),
  );
}

export function successResponse(message: string, data: any = null) {
  return createResponse('success', message, data);
}

export function createdResponse(message?: string, data: any = null) {
  const errorMessage = message?.trim()
    ? message
    : 'Resource created successfully';
  return createResponse('success', errorMessage, data);
}

export function noContentResponse(message = 'No content available') {
  return createResponse('success', message);
}
