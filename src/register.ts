import { fastify } from 'fastify'
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { fastifySwagger, fastifySwaggerOptions } from '~/plugins/openapi'
import { fastifyStatic, fastifyStaticOptions } from '~/plugins/static'
import { todoCreate } from '~/routes/todos/create'
import { todoDelete } from '~/routes/todos/delete'
import { todoId } from '~/routes/todos/id'
import { todoList } from '~/routes/todos/list'
import { todoSearch } from '~/routes/todos/search'
import { todoUpdate } from '~/routes/todos/update'
import { errorHandler } from '~/utils/error'
import { logger } from '~/utils/logger'

export const register = async () => {
  const app = fastify({ logger })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)
  app.setErrorHandler(errorHandler)

  await app.register(fastifyStatic, fastifyStaticOptions)
  await app.register(fastifySwagger, fastifySwaggerOptions)

  app.register(todoCreate)
  app.register(todoDelete)
  app.register(todoId)
  app.register(todoList)
  app.register(todoSearch)
  app.register(todoUpdate)

  return app
}
