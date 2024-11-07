import { stripIndents } from 'common-tags'
import { type ChatJoinRequestContext, InlineKeyboard } from 'puregram'

import config from '@/config.js'
import autobanService from '@/services/autoban.js'
import { BanlistService } from '@/services/banlist.js'
import { FunstatService } from '@/services/funstat.js'

export default async (context: ChatJoinRequestContext) => {
  if (context.chatId !== config.bot.chatId) return

  if (await BanlistService.get(context.from.id)) {
    await context.decline().catch(() => {})

    const message = stripIndents`
      ❌ <b>Banned user is trying to join</b>
      User: ${`${context.from.firstName} ${context.from.lastName ?? ''}`.trim()} / <code>${context.from.username ? `@${context.from.username} (${context.from.id})` : `${context.from.id}`}</code>
    `

    await context.telegram.api.sendMessage({
      chat_id: config.bot.adminChatId,
      text: message,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    })

    return
  }

  const contacts = await autobanService.getContacts()
  const isContact = contacts.some(contactId => contactId === context.from.id)
  const manualReviewEnforced = config.bot.forceManualReviewIds.includes(context.from.id)

  if (isContact && !manualReviewEnforced) {
    await context.approve().catch(() => {})

    const message = stripIndents`
      ✅ <b>Automatic approval</b>
      User: ${`${context.from.firstName} ${context.from.lastName ?? ''}`.trim()} / <code>${context.from.username ? `@${context.from.username} (${context.from.id})` : `${context.from.id}`}</code>
      Reason: <code>main_account_contact</code>
    `

    await context.telegram.api.sendMessage({
      chat_id: config.bot.adminChatId,
      text: message,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    })

    return
  }

  const message = stripIndents`
    ⏳ <b>Waiting for approval</b>
    User: ${`${context.from.firstName} ${context.from.lastName ?? ''}`.trim()} ${context.from.username ? `/ @${context.from.username}` : ''}
    ID: <code>${context.from.id}</code>
  `

  await context.telegram.api.sendMessage({
    chat_id: config.bot.adminChatId,
    text: message,
    parse_mode: 'HTML',
    link_preview_options: {
      is_disabled: true,
    },
    reply_markup: InlineKeyboard.keyboard([
      [
        InlineKeyboard.urlButton({ text: '🔎', url: FunstatService.makeFunstatUrl(context.from.id) }),
      ],
      [
        InlineKeyboard.textButton({ text: '✅', payload: `approve:${context.from.id}` }),
        InlineKeyboard.textButton({ text: '❌', payload: `reject:${context.from.id}` }),
      ],
      [
        InlineKeyboard.textButton({ text: '⛔️', payload: `ban:${context.from.id}` }),
      ],
    ]),
  })

  if (!manualReviewEnforced) {
    const userMessage = stripIndents`
      ⏳ <b>Your join request is waiting for manual approval</b>
      If you want to get informed about your request - send /start (it's telegram restriction, sorry)

      No spam, i promise. (your id is stored only in buttons on admin side)
    `

    await context.telegram.api.sendMessage({
      chat_id: context.from.id,
      text: userMessage,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
    })
  }
}
