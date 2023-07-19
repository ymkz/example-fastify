import { FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { todosMutation } from '~/repositories/mutation'
import { response400, response404, response500 } from '~/utils/error'

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
      // TODO: 事前に404チェックしたい

      const result = await todosMutation.deleteOne(request.params.id)

      if (!result) {
        return reply.status(404).send({
          code: 'TODO_NOT_FOUND',
          message: '対象のTodoが存在しません',
        })
      }

      return reply.status(200).send()
    },
  })
}
