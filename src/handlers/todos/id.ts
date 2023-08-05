import { NoResultError } from 'kysely'
import { z } from 'zod'

import { register } from '~/register'
import { todosQuery } from '~/repositories/query'
import { todoSchema } from '~/repositories/schema/todos'
import { AppError, response400, response404, response500 } from '~/utils/error'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const requestPathParam = z.object({
  id: z.coerce.number(),
})
const response200 = todoSchema

export const todoIdHandler: FastifyPluginAsync = async (app) => {
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
  const { beforeAll, expect, test, vi } = import.meta.vitest

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
    expect(response.body).toBe(
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

  test('[GET /todos/:id] リクエストパスが不正な場合、400エラーがレスポンスされること', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/todos/error',
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toHaveLength(1) // Zodのエラーオブジェクトの配列
  })

  test.todo(
    '[GET /todos/:id] リクエストパスで指定したIDのTodoが存在しない場合、404エラーがレスポンスされること',
    async () => {
      // const mockFindOneById = vi
      //   .spyOn(todosQuery, 'findOneById')
      //   .mockRejectedValue(new NoResultError({})) // TODO: ここどうすれば
      // const response = await app.inject({
      //   method: 'GET',
      //   url: '/todos/1',
      // })
      // expect(response.statusCode).toBe(404)
      // expect(response.body).toStrictEqual(JSON.stringify({}))
      // expect(mockFindOneById).toHaveBeenCalledTimes(1)
    },
  )

  test('[GET /todos/:id] DB操作時に例外が発生した場合、500エラーがレスポンスされること', async () => {
    const mockFindOneById = vi
      .spyOn(todosQuery, 'findOneById')
      .mockRejectedValue('error')

    const response = await app.inject({
      method: 'GET',
      url: '/todos/1',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toBe(
      JSON.stringify({
        code: 'TODO_ID_ERROR',
        message: 'Todoの単体取得時にエラーが発生しました',
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
  })
}
