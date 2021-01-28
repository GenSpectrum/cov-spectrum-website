const host = process.env.REACT_APP_SERVER_HOST;


export class BackendService {


  static async get(endpoint) {
    const response = await fetch(host + endpoint);
    return await response.json();
  }

}
