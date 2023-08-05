import { ZodError } from 'zod'

import { AppError, ERROR_CODE_MESSAGE } from '~/utils/error'
import { logger } from '~/utils/logger'

import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify'

export const errorHandler = (
  error: FastifyError,
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  // Zodによるリクエストスキーマのバリデーションエラーの場合
  if (error instanceof ZodError) {
    logger.warn(error)
    return reply.status(400).send(error.issues)
  }

  // アプリケーション側で定義したカスタムエラーの場合
  if (error instanceof AppError) {
    logger.error(error)
    return reply
      .status(error.statusCode)
      .send({ code: error.errorCode, message: error.message })
  }

  // それ以外のエラー処理
  logger.error(error, ERROR_CODE_MESSAGE['UNEXPECTED_ERROR'])
  return reply.status(error.statusCode ?? 500).send({
    code: error.code ?? 'UNEXPECTED_ERROR',
    message: error.message ?? '予期しないエラーが発生しました',
  })
}
