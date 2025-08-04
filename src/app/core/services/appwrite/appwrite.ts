import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Client, Account, Databases, ID, Storage, Avatars } from 'appwrite';
import { environment } from '../../../../environments/environment.production';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { from, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Appwrite {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly router = inject(Router);
  private readonly client = new Client();
  
  // Lazy-initialized services
  private _account: Account | null = null;
  private _databases: Databases | null = null;
  private _storage: Storage | null = null;
  private _avatars: Avatars | null = null;
  
  // Session key for storage
  private readonly SESSION_KEY = 'appwriteSession';

  constructor() {
    this.client
      .setEndpoint(environment.appwriteEndpoint)
      .setProject(environment.appwriteProjectId);
      
    // Initialize session from localStorage if available
    if (isPlatformBrowser(this.platformId)) {
      const sessionSecret = localStorage.getItem(this.SESSION_KEY);
      if (sessionSecret) {
        this.client.setSession(sessionSecret);
      }
    }
  }
  
  // Lazy-loaded getters for better performance
  get account(): Account {
    if (!this._account) {
      this._account = new Account(this.client);
    }
    return this._account;
  }
  
  get databases(): Databases {
    if (!this._databases) {
      this._databases = new Databases(this.client);
    }
    return this._databases;
  }
  
  get storage(): Storage {
    if (!this._storage) {
      this._storage = new Storage(this.client);
    }
    return this._storage;
  }
  
  get avatars(): Avatars {
    if (!this._avatars) {
      this._avatars = new Avatars(this.client);
    }
    return this._avatars;
  }

  /**
   * Create a new user account
   */
  createUser(email: string, password: string, name: string): Promise<any> {
    return this.account.create(ID.unique(), email, password, name);
  }
  
  /**
   * Create user as Observable
   */
  createUserObservable(email: string, password: string, name: string): Observable<any> {
    return from(this.createUser(email, password, name)).pipe(
      catchError(error => {
        console.error('Error creating user:', error);
        return of(null);
      })
    );
  }

  /**
   * Login user with email and password
   */
  login(email: string, password: string): Promise<any> {
    return this.account.createSession(email, password);
  }
  
  /**
   * Login as Observable
   */
  loginObservable(email: string, password: string): Observable<any> {
    return from(this.login(email, password));
  }

  /**
   * Get current user
   */
  getUser(): Promise<any> {
    return this.account.get();
  }
  
  /**
   * Get user as Observable
   */
  getUserObservable(): Observable<any> {
    return from(this.getUser()).pipe(
      catchError(error => {
        console.error('Error getting user:', error);
        return of(null);
      })
    );
  }

  /**
   * Logout user by deleting all sessions
   */
  logout(): Promise<any> {
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

  /**
   * Store session in localStorage and set client session
   */
  storeSession(sessionSecret: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.SESSION_KEY, sessionSecret);
      this.client.setSession(sessionSecret);
    }
  }

  /**
   * Clear session from localStorage and navigate to sign-in
   */
  clearSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.SESSION_KEY);
      // Reset service instances to force re-creation with new session
      this._account = null;
      this._databases = null;
      this._storage = null;
      this._avatars = null;
    }
    void this.router.navigate(['/auth/sign-in']);
  }
}
