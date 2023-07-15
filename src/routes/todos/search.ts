import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { todosQuery } from '~/repositories/query'
import { todosSchema } from '~/repositories/schema/todos'
import { response400, response500 } from '~/utils/error'

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
      const result = await todosQuery.findList({
        title: request.query.title,
        status: request.query.status,
        limit: request.query.limit,
        offset: request.query.offset,
      })

      return reply.send(result)
    },
  })
}
