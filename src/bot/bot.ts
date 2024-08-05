import { Telegram } from 'puregram'

import config from '@/config.js'

import callbackQuery from './events/callback-query.js'
import chatJoinRequest from './events/chat-join-request.js'

export const telegram = Telegram.fromToken(config.bot.token)

telegram.updates.on('chat_join_request', chatJoinRequest)
telegram.updates.on('callback_query', callbackQuery)
