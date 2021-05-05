import { post } from './api';
import * as zod from 'zod';
import { LoginResponseSchema } from './api-types';

const JwtDataSchema = zod.object({
  sub: zod.string(),
  exp: zod.number().transform(v => new Date(v * 1000)),
  iat: zod.number().transform(v => new Date(v * 1000)),
});

export type JwtData = zod.infer<typeof JwtDataSchema>;

const localStorageKey = 'cov-spectrum-auth';

interface Auth {
  token: string;
  data: JwtData;
}

export class AccountService {
  private static cachedAuth: Auth | undefined;

  static async login(username: string, password: string): Promise<void> {
    const response = LoginResponseSchema.parse(
      await (
        await post('/internal/login', {
          username,
          password,
        })
      ).json()
    );

    localStorage.setItem(localStorageKey, response.token);
    this.updateCachedAuth();
  }

  static logout() {
    localStorage.removeItem(localStorageKey);
    this.updateCachedAuth();
  }

  static getJwt(): string | undefined {
    const auth = AccountService.cachedAuth;
    if (auth && auth.data.exp <= new Date()) {
      AccountService.logout();
      window.location.href = '/login?expired';
      return undefined;
    }
    return auth?.token;
  }

  static isLoggedIn(): boolean {
    return !!AccountService.getJwt();
  }

  static getUsername(): string | undefined {
    return AccountService.cachedAuth?.data.sub;
  }

  static async createTemporaryJwt(endpoint: string): Promise<string> {
    if (!this.isLoggedIn()) {
      throw new Error('A temporary JWT token cannot be created when the user is not logged-in.');
    }
    const response = LoginResponseSchema.parse(
      await (await post('/internal/create-temporary-jwt?restrictionEndpoint=' + endpoint, {})).json()
    );
    return response.token;
  }

  static updateCachedAuth() {
    const token = getLocalStorageItem(localStorageKey);
    this.cachedAuth = token ? { token, data: this.parseJwt(token) } : undefined;
  }

  private static parseJwt(token: string): JwtData {
    // https://stackoverflow.com/questions/38552003/how-to-decode-jwt-token-in-javascript-without-using-a-library/38552302#38552302
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JwtDataSchema.parse(JSON.parse(jsonPayload));
  }
}

const getLocalStorageItem = (key: string): string | null => {
  try {
   return localStorage.getItem(key);
  }
  catch (e) {
    return (null);
  }
}

AccountService.updateCachedAuth();
