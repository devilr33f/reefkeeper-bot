export class FunstatService {
  private static FUNSTAT_BASE_URL = 'https://link.funstat.ru'

  static makeFunstatUrl (id: number) {
    return `${this.FUNSTAT_BASE_URL}/?start=0102${this.encodeUserId(id)}`
  }

  private static encodeUserId (id: number) {
    return id.toString(16).padStart(16, '0').match(/[a-fA-F0-9]{2}/g)!.reverse().join('').toUpperCase()
  }
}
