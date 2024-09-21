import { createDecipheriv } from 'node:crypto'

import config from '@/config.js'

class AutobanService {
  // eslint-disable-next-line no-useless-constructor
  constructor (private baseUrl: string) {}

  async getContacts (): Promise<any[]> {
    return fetch(`${this.baseUrl}/contacts`)
      .then(res => res.json())
      .then(res => {
        const { contacts } = res

        const decipher = createDecipheriv('aes-256-cbc', Buffer.from(config.autobanApi.crypto.key, 'hex'), Buffer.from(config.autobanApi.crypto.iv, 'hex'))
        const decrypted = Buffer.concat([decipher.update(Buffer.from(contacts, 'base64')), decipher.final()])

        return decrypted.toString().split(',').map(id => Number(id))
      })
      .catch(err => {
        console.error(err)

        return []
      })
  }
}

export default new AutobanService(config.autobanApi.baseUrl)
