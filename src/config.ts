import { existsSync } from 'fs'

import dotenv from 'dotenv'
import env from 'env-var'

// @note: this is required mostly for development purposes or non-docker environment
dotenv.config({
  path: (process.env.NODE_ENV === 'development' && existsSync('.env.development')) ? '.env.development' : '.env',
})

export default {
  package: {
    name: env.get('npm_package_name').default('unknown').asString(),
    version: env.get('npm_package_version').default('unknown').asString(),
    mode: env.get('NODE_ENV').default('production').asString(),
  },
  bot: {
    token: env.get('BOT_TOKEN').required().asString(),
    chatId: env.get('BOT_CHAT_ID').required().asIntNegative(),
    adminChatId: env.get('BOT_ADMIN_CHAT_ID').required().asInt(),
    forceManualReviewIds: env.get('BOT_FORCE_MANUAL_REVIEW_IDS').default('').asArray(',').map((id) => Number(id)),
  },
  redis: {
    url: env.get('REDIS_URL').required().asString(),
  },
  autobanApi: {
    baseUrl: env.get('AUTOBAN_API_BASE_URL').required().asString(),
    token: env.get('AUTOBAN_TOKEN').required().asString(),
  },
}
