import { stripIndents } from 'common-tags'
import type { CallbackQueryContext } from 'puregram'

import config from '@/config.js'
import { BanlistService } from '@/services/banlist.js'

export default async (context: CallbackQueryContext) => {
  if (context.message?.chatId !== config.bot.adminChatId) return

  const [action, userId] = (context.queryPayload as string).split(':')

  switch (action) {
  case 'approve':
    await context.telegram.api.approveChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    await context.message.reply('✅ <b>Approved</b>', { parse_mode: 'HTML' })
    break

  case 'ban': {
    const isBanned = await BanlistService.get(userId)

    const action = isBanned ? 'unban' : 'ban'

    if (action === 'ban') {
      await Promise.all([
        BanlistService.add(userId),
        context.message.reply('⛔️ <b>Banned</b>', { parse_mode: 'HTML' }),
      ])
    } else {
      await Promise.all([
        BanlistService.remove(userId),
        context.message.reply('🕊 <b>Unbanned</b>', { parse_mode: 'HTML' }),
      ])
    }
  }
    break

  case 'reject':
    await context.telegram.api.declineChatJoinRequest({ chat_id: config.bot.chatId, user_id: parseInt(userId) }).catch(() => {})

    context.telegram.api.sendMessage({
      chat_id: parseInt(userId),
      text: stripIndents`
        ❌ <b>Your join request was rejected</b>

        Maybe i don't know you, or i simply don't want you in my channel. Anyway, try again in the future.

        If you're REALLY want to join, please <a href="https://femboy.page?utm_source=reefkeeper">contact me</a> and write few words about yourself.
      `,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      suppress: true,
    })

    await context.message.reply('❌ <b>Rejected</b>', { parse_mode: 'HTML' }).catch(() => {})

    break

  default:
    break
  }

  await context.answerCallbackQuery().catch(() => {})
}
