import { z } from 'zod'

import { register } from '~/register'
import { todosQuery } from '~/repositories/query'
import { todosSchema } from '~/repositories/schema/todos'
import { AppError, response400, response500 } from '~/utils/error'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const requestQuery = z.object({
  title: z.string().nonempty().optional(),
  status: z.enum(['progress', 'pending', 'done']).optional(),
  limit: z.coerce.number().int().positive().optional(),
  offset: z.coerce.number().int().optional(),
})
const response200 = todosSchema

export const todoSearch: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/todos/search',
    schema: {
      description: 'Todoの検索',
      tags: ['todos'],
      querystring: requestQuery,
      response: {
        200: response200,
        400: response400,
        500: response500,
      },
    },
    handler: async (request, reply) => {
      const result = await todosQuery
        .search({
          title: request.query.title,
          status: request.query.status,
          limit: request.query.limit,
          offset: request.query.offset,
        })
        .catch((cause) => {
          throw new AppError('TODO_SEARCH_ERROR', { cause })
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

  test('[GET /todos/search] 正常にレスポンスされること', async () => {
    const mockSearch = vi.spyOn(todosQuery, 'search').mockResolvedValue([
      {
        id: 1,
        title: '',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      },
    ])

    const response = await app.inject({
      method: 'GET',
      url: '/todos/search',
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(
      JSON.stringify([
        {
          id: 1,
          title: '',
          status: 'progress',
          created_at: '',
          updated_at: null,
          deleted_at: null,
        },
      ]),
    )
    expect(mockSearch).toHaveBeenCalledTimes(1)
  })

  test.todo(
    '[GET /todos/search] 許可されていないクエリパラメータでのリクエストはバリデーションエラーになること',
  )
  test.todo(
    '[GET /todos/search] 処理中に例外が発生した場合エラーがレスポンスされること',
  )
}
