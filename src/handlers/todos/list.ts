import { z } from 'zod'

import { register } from '~/register'
import { todosQuery } from '~/repositories/query'
import { todosSchema } from '~/repositories/schema/todos'
import { AppError, response400, response500 } from '~/utils/error'

import type { FastifyInstance, FastifyPluginAsync } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'

const requestQuery = z.object({
  status: z.enum(['progress', 'pending', 'done']).optional(),
})
const response200 = todosSchema

export const todoListHandler: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/todos',
    schema: {
      description: 'Todoの一覧取得',
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
        .findListByStatus(request.query.status)
        .catch((cause) => {
          throw new AppError('TODO_LIST_ERROR', { cause })
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

  test('[GET /todos] 正常にレスポンスされること', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/todos',
    })

    expect(response.statusCode).toBe(200)
  })

  test('[GET /todos] クエリパラメータが不正な場合、400エラーがレスポンスされること', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/todos?status=error',
    })

    expect(response.statusCode).toBe(400)
    expect(JSON.parse(response.body)).toHaveLength(1) // Zodのエラーオブジェクトの配列
  })

  test('[GET /todos] DB操作時に例外が発生した場合、500エラーがレスポンスされること', async () => {
    const mockFindListByStatus = vi
      .spyOn(todosQuery, 'findListByStatus')
      .mockRejectedValue('error')

    const response = await app.inject({
      method: 'GET',
      url: '/todos',
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toBe(
      JSON.stringify({
        code: 'TODO_LIST_ERROR',
        message: 'Todoの一覧取得時にエラーが発生しました',
      }),
    )
    expect(mockFindListByStatus).toHaveBeenCalledTimes(1)
  })
}
