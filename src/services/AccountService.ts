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

export class AccountService {
  static async login(username: string, password: string): Promise<void> {
    const response = LoginResponseSchema.parse(
      await (
        await post('/internal/login', {
          username,
          password,
        })
      ).json()
    );
    console.log('Login response is ', response);
    localStorage.setItem(localStorageKey, response.token);
  }

  static logout() {
    localStorage.removeItem(localStorageKey);
  }

  static getJwt(): string | undefined {
    const auth = AccountService.getAuth();
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
    return AccountService.getAuth()?.data.sub;
  }

  private static getAuth(): { token: string; data: JwtData } | undefined {
    const token = localStorage.getItem(localStorageKey);
    return token ? { token, data: this.parseJwt(token) } : undefined;
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
