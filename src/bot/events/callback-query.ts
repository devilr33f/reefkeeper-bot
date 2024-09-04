import { oneLine, stripIndents } from 'common-tags'
import type { CallbackQueryContext } from 'puregram'

import config from '@/config.js'

export default async (context: CallbackQueryContext) => {
  if (context.message?.chatId !== config.bot.adminChatId) return

  const [action, userId] = (context.queryPayload as string).split(':')

  switch (action) {
  case 'approve':
    await context.telegram.api.approveChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    await context.message.reply(oneLine`
        ✅ <b>Approved</b>
    `, { parse_mode: 'HTML' })
    break

  case 'reject':
    await context.telegram.api.declineChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    context.telegram.api.sendMessage({
      chat_id: parseInt(userId),
      text: stripIndents`
        ❌ <b>Your join request was rejected</b>

        Maybe i don't know you, or i simply don't want you in my channel. Anyway, try again in future.

        If you're REALLY want to join, please <a href="https://femboy.page?utm_source=reefkeeper">contact me</a> and write few words about yourself.
      `,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      suppress: true,
    })

    await context.message.reply(oneLine`
       ❌ <b>Rejected</b>
    `, { parse_mode: 'HTML' }).catch(() => {})

    break

  default:
    break
  }

  await context.answerCallbackQuery().catch(() => {})
}
