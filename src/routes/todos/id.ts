import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { todosQuery } from '~/repositories/query'
import { todoSchema } from '~/repositories/schema/todos'
import { response400, response404, response500 } from '~/utils/error'

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
      const result = await todosQuery.findOneById({
        id: request.params.id,
      })

      if (!result) {
        return reply.status(404).send()
      }

      return reply.send(result)
    },
  })
}
