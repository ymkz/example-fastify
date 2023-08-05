import { ZodError, z } from 'zod'

import { logger } from '~/utils/logger'

import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

const ERROR_CODE_MESSAGE = {
  UNEXPECTED_ERROR: '予期しないエラーが発生しました',
  TODO_NOT_FOUND: '対象のTodoが存在しません',
  TODO_ID_ERROR: 'Todoの単体取得時にエラーが発生しました',
  TODO_LIST_ERROR: 'Todoの一覧取得時にエラーが発生しました',
  TODO_SEARCH_ERROR: 'Todoの検索時にエラーが発生しました',
  TODO_CREATE_ERROR: 'Todoの新規作成時にエラーが発生しました',
  TODO_DELETE_ERROR: 'Todoの削除時にエラーが発生しました',
  TODO_UPDATE_ERROR: 'Todoの更新時にエラーが発生しました',
}

export class AppError extends Error {
  errorCode: string
  statusCode: number

  static {
    this.prototype.name = 'AppError'
  }

  constructor(
    errorCode: keyof typeof ERROR_CODE_MESSAGE = 'UNEXPECTED_ERROR',
    { statusCode, ...options }: ErrorOptions & { statusCode?: number },
  ) {
    super(ERROR_CODE_MESSAGE[errorCode], options)
    this.errorCode = errorCode
    this.statusCode = statusCode ?? 500
  }
}

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

export const notFoundHandler = async (
  _: FastifyRequest,
  reply: FastifyReply,
) => {
  return reply.status(404).send()
}

export const response400 = z.array(z.any())

export const response404 = z.object({
  code: z.string(),
  message: z.string(),
})

export const response500 = z.object({
  code: z.string(),
  message: z.string(),
})
