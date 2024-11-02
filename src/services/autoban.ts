import config from '@/config.js'

class AutobanService {
  // eslint-disable-next-line no-useless-constructor
  constructor (private baseUrl: string) {}

  async getContacts (): Promise<number[]> {
    return fetch(`${this.baseUrl}/contacts`, {
      headers: {
        Authorization: `Bearer ${config.autobanApi.token}`,
      },
    }).then(res => res.json())
      .then(res => {
        const { contacts } = res

        return contacts.map((id: any) => Number(id))
      })
      .catch(err => {
        console.error(err)

        return []
      })
  }
}

export default new AutobanService(config.autobanApi.baseUrl)
