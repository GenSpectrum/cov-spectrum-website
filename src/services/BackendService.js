import { AccountService } from "./AccountService";

const host = process.env.REACT_APP_SERVER_HOST;


export class BackendService {

  static async get(endpoint) {
    const response = await fetch(host + endpoint, {
      headers: BackendService._getBaseHeaders()
    });
    return await response.json();
  }


  static async post(endpoint, body) {
    const response = await fetch(host + endpoint, {
      method: 'POST',
      headers: BackendService._getBaseHeaders(),
      body: JSON.stringify(body)
    });
    return await response.json();
  }


  static _getBaseHeaders() {
    const headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
    if (AccountService.isLoggedIn()) {
      headers['Authorization'] = 'Bearer ' + AccountService.getJwt();
    }
    return headers;
  }

}
