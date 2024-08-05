import { oneLine } from 'common-tags'
import type { CallbackQueryContext } from 'puregram'

import config from '@/config.js'

export default async (context: CallbackQueryContext) => {
  if (context.message?.chatId !== config.bot.adminChatId) return

  const [action, userId] = (context.queryPayload as string).split(':')

  switch (action) {
  case 'approve':
    await context.telegram.api.approveChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    await context.message.delete().catch(() => {})
    break

  case 'reject':
    await context.telegram.api.declineChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    context.telegram.api.sendMessage({
      chat_id: parseInt(userId),
      text: oneLine`
        ❌ <b>Your join request was rejected</b>
      `,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      suppress: true,
    })

    break

  default:
    break
  }

  await context.answerCallbackQuery().catch(() => {})
}
