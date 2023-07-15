import { FastifyStaticOptions } from '@fastify/static'
import { resolve } from 'node:path'

export { fastifyStatic } from '@fastify/static'

export const fastifyStaticOptions: FastifyStaticOptions = {
  // TODO: docsはNODE_ENV=developmentのみにしたい
  root: [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'docs')],
}
