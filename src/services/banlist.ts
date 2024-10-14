import { Redis } from 'ioredis'

import config from '@/config.js'

export class BanlistService {
  private static redis = new Redis(config.redis.url)

  static async add (id: number | string): Promise<void> {
    await BanlistService.redis.set(`banlist:${id}`, Date.now().toString())
  }

  static async get (id: number | string): Promise<boolean> {
    const banlist = await BanlistService.redis.get(`banlist:${id}`)

    return !!banlist
  }

  static async remove (id: number | string): Promise<void> {
    await BanlistService.redis.del(`banlist:${id}`)
  }
}
