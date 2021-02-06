import { BackendService } from './BackendService'

export class AccountService {
  /**
   * @return {Promise<boolean>} true if login was successful; otherwise false
   */
  static async login(username, password) {
    // Login attempt: Get a JWT token
    const response = await (
      await BackendService.post('/internal/login', {
        username,
        password,
      })
    ).json()
    if (response.error) {
      return false
    }

    // Parse token
    const token = response.token
    const parsed = AccountService._parseJwt(token)

    // Keep the token in the local storage
    localStorage.setItem('auth', JSON.stringify({ token, parsed }))

    return true
  }

  static logout() {
    // The backend is currently not able to invalidate tokens.
    localStorage.removeItem('auth')
  }

  static getJwt() {
    const auth = AccountService._getAuth()
    if (auth && auth.parsed.exp <= new Date()) {
      AccountService.logout()
      window.location.href = '/login?expired'
      return
    }
    return auth?.token
  }

  static isLoggedIn() {
    return !!AccountService.getJwt()
  }

  static getUsername() {
    return AccountService._getAuth()?.parsed.sub
  }

  static _getAuth() {
    const auth = JSON.parse(localStorage.getItem('auth'));
    if (auth) {
      auth.parsed.exp = new Date(auth.parsed.exp);
      auth.parsed.iat = new Date(auth.parsed.iat);
    }
    return auth;
  }

  static _parseJwt(token) {
    // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library/38552302#38552302
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )

    const parsed = JSON.parse(jsonPayload)
    return {
      sub: parsed.sub,
      exp: new Date(parsed.exp * 1000),
      iat: new Date(parsed.iat * 1000),
    }
  }
}
