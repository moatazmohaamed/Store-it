`use server`;
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Client, Account, Databases, ID, Storage, Avatars } from 'appwrite';
import { error } from 'console';
import { environment } from '../../../../environments/environment.production';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class Appwrite {
  id = inject(PLATFORM_ID);
  router = inject(Router);
  client = new Client();
  account: Account;
  databases: Databases;
  storage!: Storage;
  avatars!: Avatars;

  constructor() {
    this.client
      .setEndpoint(environment.appwriteEndpoint)
      .setProject(environment.appwriteProjectId);

    this.account = new Account(this.client);
    this.databases = new Databases(this.client);
    this.storage = new Storage(this.client);
    this.avatars = new Avatars(this.client);
  }

  createUser(email: string, password: string, name: string) {
    return this.account.create(ID.unique(), email, password, name);
  }

  login(email: string, password: string) {
    return this.account.createSession(email, password);
  }

  getUser() {
    return this.account.get();
  }

  logout() {
    return this.account.deleteSessions();
  }

  async createAdminClient() {
    const client = new Client()
      .setEndpoint(environment.appwriteEndpoint)
      .setProject(environment.appwriteProjectId)
      .setDevKey(environment.SECRET_kEY);

    return {
      get account() {
        return new Account(client);
      },
      get databases() {
        return new Databases(client);
      },
      get storage() {
        return new Storage(client);
      },
      get avatars() {
        return new Avatars(client);
      },
    };
  }

  storeSession(sessionSecret: string) {
    localStorage.setItem('appwriteSession', sessionSecret);
    this.client.setSession(sessionSecret);
  }

  clearSession() {
    localStorage.removeItem('appwriteSession');
    this.router.navigate(['/auth/sign-in']);
  }
}
