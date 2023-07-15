import dayjs from 'dayjs'
import { pino } from 'pino'

export const logger = pino({
  enabled: process.env.NODE_ENV !== 'test',
  timestamp: () => {
    return `,"timestamp":"${dayjs().format('YYYY-MM-DDTHH:mm:ss.SSS')}"`
  },
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() }
    },
    bindings: () => {
      return {}
    },
  },
})
