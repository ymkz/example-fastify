import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { todosMutation } from '~/repositories/mutation'
import { todoSchema } from '~/repositories/schema/todos'
import { response400, response404, response500 } from '~/utils/error'

const requestPathParam = z.object({
  id: z.coerce.number(),
})
const requestBody = z.object({
  title: z.string().nonempty().optional(),
  status: z.enum(['progress', 'pending', 'done']).optional(),
})
const response200 = todoSchema

export const todoUpdate: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/todos/:id',
    schema: {
      description: 'Todoの更新',
      tags: ['todos'],
      params: requestPathParam,
      body: requestBody,
      response: {
        200: response200,
        400: response400,
        404: response404,
        500: response500,
      },
    },
    handler: async (request, reply) => {
      // TODO: 事前に404チェックしたい

      const result = await todosMutation.updateOne(
        request.params.id,
        request.body.title,
        request.body.status,
      )

      if (!result) {
        return reply.status(404).send()
      }

      return reply.status(200).send(result)
    },
  })
}
