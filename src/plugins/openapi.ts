import { jsonSchemaTransform } from 'fastify-type-provider-zod'

import type { FastifyDynamicSwaggerOptions } from '@fastify/swagger'

export { fastifySwagger } from '@fastify/swagger'

export const fastifySwaggerOptions: FastifyDynamicSwaggerOptions = {
  transform: jsonSchemaTransform,
  openapi: {
    info: {
      title: 'title',
      description: 'description',
      version: '0.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'ローカル環境',
      },
      {
        url: 'http://localhost:3000',
        description: '開発環境',
      },
      {
        url: 'http://localhost:3000',
        description: 'ステージング環境',
      },
      {
        url: 'http://localhost:3000',
        description: '本番環境',
      },
    ],
  },
}
