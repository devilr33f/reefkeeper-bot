import { oneLine } from 'common-tags'
import { createLogger, format, transports } from 'winston'

import config from '@/config.js'

import { telegram } from './bot/bot.js'
import AutobanService from './services/autoban.js'

const logger = createLogger({
  level: 'info',
  defaultMeta: { type: 'index' },
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, type }) => {
      return `${timestamp} [${level}] ${type}: ${message}`
    }),
  ),
  transports: [
    new transports.Console(),
  ],
})

const init = async () => {
  logger.info(oneLine`
    starting
    ${config.package.name}
    (${config.package.version})
    in ${config.package.mode} mode...
  `)

  const contactsCount = await AutobanService.getContacts()
  logger.info(`Loaded contacts: ${contactsCount.length}`)

  telegram.updates.startPolling()
    .then(() => logger.info('Bot started'))
    .catch(err => logger.error(err))
}

init()
