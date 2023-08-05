import { resolve } from 'node:path'

import type { FastifyStaticOptions } from '@fastify/static'

export { fastifyStatic } from '@fastify/static'

export const fastifyStaticOptions: FastifyStaticOptions = {
  // TODO: docsはNODE_ENV=developmentのみにしたい
  root: [resolve(process.cwd(), 'public'), resolve(process.cwd(), 'docs')],
}
