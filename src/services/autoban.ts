import config from '@/config.js'

class AutobanService {
  // eslint-disable-next-line no-useless-constructor
  constructor (private baseUrl: string) {}

  async getContacts (): Promise<any[]> {
    return fetch(`${this.baseUrl}/contacts`)
      .then(res => res.json())
      .catch(err => {
        console.error(err)

        return []
      })
  }
}

export default new AutobanService(config.autobanApi.baseUrl)
