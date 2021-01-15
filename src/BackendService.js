const host = '//localhost:30000';


export class BackendService {


  static async get(endpoint) {
    const response = await fetch(host + endpoint);
    return await response.json();
  }

}
