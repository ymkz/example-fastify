import { z } from 'zod'

import { register } from '~/register'
import { todosMutation } from '~/repositories/mutation'
import { todosQuery } from '~/repositories/query'
import { AppError, response400, response404, response500 } from '~/utils/error'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const requestPathParam = z.object({
  id: z.coerce.number(),
})
const response200 = z.never()

export const todoDelete: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/todos/:id',
    schema: {
      description: 'Todoの削除',
      tags: ['todos'],
      params: requestPathParam,
      response: {
        200: response200,
        400: response400,
        404: response404,
        500: response500,
      },
    },
    handler: async (request, reply) => {
      await todosQuery.findOneById(request.params.id).catch((cause) => {
        throw new AppError('TODO_NOT_FOUND', { cause, statusCode: 404 })
      })

      await todosMutation.deleteOne(request.params.id).catch((cause) => {
        throw new AppError('TODO_DELETE_ERROR', { cause })
      })

      return reply.send()
    },
  })
}

if (import.meta.vitest) {
  const { beforeAll, expect, test, vi } = import.meta.vitest

  let app: FastifyInstance

  beforeAll(async () => {
    app = await register()
    await app.ready()
  })

  test('[DELETE /todos/:id] 正常にレスポンスされること', async () => {
    const mockFindOneById = vi
      .spyOn(todosQuery, 'findOneById')
      .mockResolvedValue({
        id: 1,
        title: '',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      })
    const mockDeleteOne = vi
      .spyOn(todosMutation, 'deleteOne')
      .mockResolvedValue()

    const response = await app.inject({
      method: 'DELETE',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe('')
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
    expect(mockDeleteOne).toHaveBeenCalledTimes(1)
  })

  test.todo(
    '[DELETE /todos/:id] パスパラメータで指定したIDのTodoが存在しない場合エラーがレスポンスされること',
  )
  test.todo(
    '[DELETE /todos/:id] 処理中に例外が発生した場合エラーがレスポンスされること',
  )
}
