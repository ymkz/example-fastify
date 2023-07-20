import { FastifyInstance, FastifyPluginAsync } from 'fastify'
import { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'
import { register } from '~/register'
import { todosMutation } from '~/repositories/mutation'
import { todoSchema } from '~/repositories/schema/todos'
import { AppError, response400, response500 } from '~/utils/error'

const requestBody = z.object({
  title: z.string().nonempty(),
})
const response200 = todoSchema

export const todoCreate: FastifyPluginAsync = async (app) => {
  app.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/todos',
    schema: {
      description: 'Todoの新規作成',
      tags: ['todos'],
      body: requestBody,
      response: {
        200: response200,
        400: response400,
        500: response500,
      },
    },
    handler: async (request, reply) => {
      const result = await todosMutation
        .createOne(request.body.title)
        .catch((cause) => {
          throw new AppError('TODO_CREATE_ERROR', { cause })
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

  test('[POST /todos] 正常にレスポンスされること', async () => {
    const title = 'title'
    const mockCreateOne = vi
      .spyOn(todosMutation, 'createOne')
      .mockResolvedValue({
        id: 0,
        title,
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      })

    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      body: { title },
    })

    expect(response.statusCode).toBe(200)
    expect(response.body).toBe(
      JSON.stringify({
        id: 0,
        title,
        status: 'progress',
        created_at: '',
        updated_at: null,
        deleted_at: null,
      }),
    )
    expect(mockCreateOne).toHaveBeenCalledTimes(1)
  })

  test('[POST /todos] リクエストボディが空の場合バリデーションエラーになること', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      body: {},
    })

    expect(response.statusCode).toBe(400)
  })

  test('[POST /todos] リクエストボディにtitleがない場合バリデーションエラーになること', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      body: { error: 'error' },
    })

    expect(response.statusCode).toBe(400)
  })

  test('[POST /todos] titleが空文字の場合バリデーションエラーになること', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      body: { title: '' },
    })

    expect(response.statusCode).toBe(400)
  })

  test('[POST /todos] 処理中に例外が発生した場合エラーがレスポンスされること', async () => {
    const title = 'title'
    const mockCreateOne = vi
      .spyOn(todosMutation, 'createOne')
      .mockRejectedValue('error')

    const response = await app.inject({
      method: 'POST',
      url: '/todos',
      body: { title },
    })

    expect(response.statusCode).toBe(500)
    expect(response.body).toBe(
      JSON.stringify({
        code: 'TODO_CREATE_ERROR',
        message: 'Todoの新規作成時にエラーが発生しました',
      }),
    )
    expect(mockCreateOne).toHaveBeenCalledTimes(1)
  })
}
