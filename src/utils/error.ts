import { z } from 'zod'

export const ERROR_CODE_MESSAGE = {
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

export const response400 = z.array(z.any())

export const response404 = z.object({
  code: z.string(),
  message: z.string(),
})

export const response500 = z.object({
  code: z.string(),
  message: z.string(),
})
