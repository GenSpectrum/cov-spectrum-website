import { AccountService } from './AccountService'
import { CancelableRequest } from '../core/CancelableRequest'

const host = process.env.REACT_APP_SERVER_HOST

export class BackendService {
  static get(endpoint) {
    return CancelableRequest.cancelableFetch(host + endpoint, {
      headers: BackendService._getBaseHeaders(),
    })
  }

  static post(endpoint, body) {
    return CancelableRequest.cancelableFetch(host + endpoint, {
      method: 'POST',
      headers: BackendService._getBaseHeaders(),
      body: JSON.stringify(body),
    })
  }

  static _getBaseHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (AccountService.isLoggedIn()) {
      headers['Authorization'] = 'Bearer ' + AccountService.getJwt()
    }
    return headers
  }
}
