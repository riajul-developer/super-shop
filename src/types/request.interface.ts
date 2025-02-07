import { FastifyRequest } from 'fastify';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: number;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
}
