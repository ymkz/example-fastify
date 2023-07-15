import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'
import { ZodError, z } from 'zod'
import { logger } from '~/utils/logger'

export const errorHandler = (
  error: FastifyError,
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  // Zodによるリクエストのスキーマエラーの場合
  if (error instanceof ZodError) {
    logger.warn({ error: error.issues })
    return reply.status(400).send({ error: error.issues })
  }

  return reply.status(error.statusCode ?? 500).send({
    error: {
      code: error.code ?? 'UNEXPECTED_ERROR',
      message: error.message ?? '予期しないエラーが発生しました',
    },
  })
}

export const response400 = z.object({
  error: z.array(z.any()),
})

export const response404 = z.any()

export const response500 = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
