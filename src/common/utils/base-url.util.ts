import { FastifyRequest } from 'fastify';

export default function BaseUrl(
  req: FastifyRequest,
  path: string = '',
): string {
  const protocol = req.headers['x-forwarded-proto'] || 'http';
  const host = req.headers.host;
  return `${protocol}://${host}${path}`;
}