import type { FastifyRequest, FastifyReply } from 'fastify'

export const notFoundHandler = async (
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  return reply.status(404).send()
}
