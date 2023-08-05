import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'

import { errorHandler } from '~/handlers/error/error'
import { notFoundHandler } from '~/handlers/error/not-found'
import { todoCreateHandler } from '~/handlers/todos/create'
import { todoDeleteHandler } from '~/handlers/todos/delete'
import { todoIdHandler } from '~/handlers/todos/id'
import { todoListHandler } from '~/handlers/todos/list'
import { todoSearchHandler } from '~/handlers/todos/search'
import { todoUpdateHandler } from '~/handlers/todos/update'
import { fastifySwagger, fastifySwaggerOptions } from '~/plugins/openapi'
import { fastifyStatic, fastifyStaticOptions } from '~/plugins/static'
import { logger } from '~/utils/logger'

export const register = async () => {
  const app = fastify({ logger })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setNotFoundHandler(notFoundHandler)
  app.setErrorHandler(errorHandler)

  await app.register(fastifyStatic, fastifyStaticOptions)
  await app.register(fastifySwagger, fastifySwaggerOptions)

  app.register(todoCreateHandler)
  app.register(todoDeleteHandler)
  app.register(todoIdHandler)
  app.register(todoListHandler)
  app.register(todoSearchHandler)
  app.register(todoUpdateHandler)

  return app
}
