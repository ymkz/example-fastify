import '~/utils/env'

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { register } from '~/register'
import { logger } from '~/utils/logger'

register()
  .then(async (app) => {
    await app.ready()
    await app.listen({ port: 3000 })

    logger.info(`Running as ${process.env.NODE_ENV}`)

    if (process.env.NODE_ENV === 'development') {
      writeFile(
        resolve(process.cwd(), 'docs/openapi.yaml'),
        app.swagger({ yaml: true }),
      ).then(() => {
        logger.info('Generated docs/openapi.yaml')
      })
    }
  })
  .catch((err) => {
    logger.fatal(err, 'Server crashed')
    process.exit(1)
  })
