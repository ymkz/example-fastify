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

  test('[GET /todos/:id] リクエストパスが不正な場合、400エラーがレスポンスされること', async () => {
    const response = await app.inject({
      method: 'DELETE',
      url: '/todos/error',
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toHaveLength(1) // Zodのエラーオブジェクトの配列
  })

  test('[DELETE /todos/:id] リクエストパスで指定したIDのTodoが存在しない場合、404エラーがレスポンスされること', async () => {
    const mockFindOneById = vi
      .spyOn(todosQuery, 'findOneById')
      .mockRejectedValue('error')

    const response = await app.inject({
      method: 'DELETE',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(404)
    expect(response.body).toStrictEqual(
      JSON.stringify({
        code: 'TODO_NOT_FOUND',
        message: '対象のTodoが存在しません',
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
  })

  test('[DELETE /todos/:id] DELETE操作時に例外が発生した場合、500エラーがレスポンスされること', async () => {
    const mockFindOneById = vi.spyOn(todosQuery, 'findOneById')
    const mockDeleteOne = vi
      .spyOn(todosMutation, 'deleteOne')
      .mockRejectedValue('error')

    const response = await app.inject({
      method: 'DELETE',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toBe(
      JSON.stringify({
        code: 'TODO_DELETE_ERROR',
        message: 'Todoの削除時にエラーが発生しました',
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
    expect(mockDeleteOne).toHaveBeenCalledTimes(1)
  })
}
