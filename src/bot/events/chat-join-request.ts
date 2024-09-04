import { oneLine, stripIndents } from 'common-tags'
import { type ChatJoinRequestContext, InlineKeyboard } from 'puregram'

import config from '@/config.js'
import autobanService from '@/services/autoban.js'

export default async (context: ChatJoinRequestContext) => {
  if (context.chatId !== config.bot.chatId) return

  const contacts = await autobanService.getContacts()
  const isContact = contacts.some(contact => contact.id === context.from.id)

  if (isContact) {
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

  const userMessage = stripIndents`
    ⏳ <b>Your join request is waiting for manual approval</b>
    If you want to get informed about your request - send /start (it's telegram restriction, sorry)

    No spam, i promise. (i don't even store your id)
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
        InlineKeyboard.textButton({ text: '✅', payload: `approve:${context.from.id}` }),
        InlineKeyboard.textButton({ text: '❌', payload: `reject:${context.from.id}` }),
      ],
    ]),
  })

  await context.telegram.api.sendMessage({
    chat_id: context.from.id,
    text: userMessage,
    parse_mode: 'HTML',
    link_preview_options: {
      is_disabled: true,
    },
  })
}
