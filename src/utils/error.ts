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
    const payload = { error: error.issues }
    logger.warn(payload)
    return reply.status(400).send(payload)
  }

  // それ以外のエラー処理
  const payload = {
    error: {
      code: error.code ?? 'UNEXPECTED_ERROR',
      message: error.message ?? '予期しないエラーが発生しました',
    },
  }
  logger.error(payload)
  return reply.status(error.statusCode ?? 500).send(payload)
}

export const notFoundHandler = async (
  _request: FastifyRequest,
  reply: FastifyReply,
) => {
  return reply.status(404).send({ code: 'NOT_FOUND' })
}

export const response400 = z.object({
  error: z.array(z.any()),
})

export const response404 = z.object({
  code: z.string(),
  message: z.string().optional(),
})

export const response500 = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
