import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { NoResultError } from 'kysely'
import { z } from 'zod'
import { register } from '~/register'
import { todosQuery } from '~/repositories/query'
import { todoSchema } from '~/repositories/schema/todos'
import { AppError, response400, response404, response500 } from '~/utils/error'

const requestPathParam = z.object({
  id: z.coerce.number(),
})
const response200 = todoSchema

export const todoId: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/todos/:id',
    schema: {
      description: 'Todoの取得',
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
      const result = await todosQuery
        .findOneById(request.params.id)
        .catch((cause) => {
          if (cause instanceof NoResultError) {
            throw new AppError('TODO_NOT_FOUND', { cause, statusCode: 404 })
          } else {
            throw new AppError('TODO_ID_ERROR', { cause })
          }
        })

      return reply.send(result)
    },
  })
}

if (import.meta.vitest) {
  const { test, expect, vi, beforeAll } = import.meta.vitest

  let app: FastifyInstance

  beforeAll(async () => {
    app = await register()
    await app.ready()
  })

  test('[GET /todos/:id] 正常にレスポンスされること', async () => {
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

    const response = await app.inject({
      method: 'GET',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(
      JSON.stringify({
        id: 1,
        title: '',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
  })

  test('[GET /todos/:id] 処理中に例外が発生した場合エラーがレスポンスされること', async () => {
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

    const response = await app.inject({
      method: 'GET',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(
      JSON.stringify({
        id: 1,
        title: '',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
  })
}
