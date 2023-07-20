import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { register } from '~/register'
import { todosMutation } from '~/repositories/mutation'
import { todosQuery } from '~/repositories/query'
import { todoSchema } from '~/repositories/schema/todos'
import { AppError, response400, response404, response500 } from '~/utils/error'

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
      await todosQuery.findOneById(request.params.id).catch((cause) => {
        throw new AppError('TODO_NOT_FOUND', { cause })
      })

      const result = await todosMutation
        .updateOne(request.params.id, request.body.title, request.body.status)
        .catch((cause) => {
          throw new AppError('TODO_UPDATE_ERROR', { cause })
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

  test('[PATCH /todos/:id] 正常にレスポンスされること', async () => {
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
    const mockUpdateOne = vi
      .spyOn(todosMutation, 'updateOne')
      .mockResolvedValue({
        id: 1,
        title: 'title_updated',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      })

    const response = await app.inject({
      method: 'PATCH',
      url: '/todos/1',
      body: {
        title: 'title_updated',
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toStrictEqual(
      JSON.stringify({
        id: 1,
        title: 'title_updated',
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      }),
    )
    expect(mockFindOneById).toHaveBeenCalledTimes(1)
    expect(mockUpdateOne).toHaveBeenCalledTimes(1)
  })
}
