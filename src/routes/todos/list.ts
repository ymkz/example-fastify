import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { register } from '~/register'
import { todosQuery } from '~/repositories/query'
import { todosSchema } from '~/repositories/schema/todos'
import { response400, response500 } from '~/utils/error'

const requestQuery = z.object({
  status: z.enum(['progress', 'pending', 'done']).default('progress'),
})
const response200 = todosSchema

export const todoList: FastifyPluginAsync = async (app) => {
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
      const result = await todosQuery.findList({
        status: request.query.status,
      })

      return reply.send(result)
    },
  })
}

if (import.meta.vitest) {
  const { test, expect, beforeAll } = import.meta.vitest

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
}
