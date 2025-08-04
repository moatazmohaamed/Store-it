import { inject, Injectable } from '@angular/core';
import { ID, Query } from 'appwrite';
import { Appwrite } from '../appwrite/appwrite';
import { environment } from '../../../../environments/environment.production';
import {
  avatarPlaceholderUrl,
  parseStringfy,
} from '../../../shared/utils/utils';
import { ToastrService } from 'ngx-toastr';
import { catchError, from, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly appwrite = inject(Appwrite);
  private readonly toastr = inject(ToastrService);
  
  // Cache for current user to avoid repeated API calls
  private currentUserCache: any = null;
  private userByEmailCache = new Map<string, any>();
  
  constructor() {}

  /**
   * Get user by email with caching for better performance
   */
  async getUserByEmail(email: string): Promise<any> {
    // Check cache first
    if (this.userByEmailCache.has(email)) {
      return this.userByEmailCache.get(email);
    }
    
    try {
      const result = await this.appwrite.databases.listDocuments(
        environment.DATABASE_ID,
        environment.USERS_COLLECTION,
        [Query.equal('email', [email])]
      );
      
      const user = result.total > 0 ? result.documents[0] : null;
      
      // Cache the result
      this.userByEmailCache.set(email, user);
      
      return user;
    } catch (error) {
      console.error('Error fetching user', error);
      return null;
    }
  }
  
  /**
   * Get user by email as Observable for reactive programming
   */
  getUserByEmailObservable(email: string): Observable<any> {
    return from(this.getUserByEmail(email));
  }

  async sendEmailOTP(email: string): Promise<string | null> {
    try {
      const result = await this.appwrite.account.createEmailToken(
        ID.unique(),
        email
      );
      return result.userId;
    } catch (error) {
      this.toastr.error('Server is busy please try again later');
      return null;
    }
  }

  async createAccount(fullName: string, email: string): Promise<string | null> {
    const accountId = await this.sendEmailOTP(email);
    if (!accountId) return null;

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) {
      await this.appwrite.databases.createDocument(
        environment.DATABASE_ID,
        environment.USERS_COLLECTION,
        ID.unique(),
        {
          fullName,
          email,
          avatar: avatarPlaceholderUrl,
          accountId,
        }
      );
    }

    return parseStringfy(accountId);
  }

  async verifySecret(
    accountId: string,
    password: string
  ): Promise<string | null> {
    try {
      const { account } = await this.appwrite.createAdminClient();

      const session = await account.createSession(accountId, password);
      this.appwrite.storeSession(session.secret);
      return parseStringfy(session.$id);
    } catch (error) {
      console.error('Failed to verify OTP', error);
      return null;
    }
  }

  /**
   * Get current user with caching for better performance
   */
  async getCurrentUser(): Promise<any> {
    // Return cached user if available
    if (this.currentUserCache) {
      return this.currentUserCache;
    }
    
    try {
      const result = await this.appwrite.account.get();

      const user = await this.appwrite.databases.listDocuments(
        environment.DATABASE_ID,
        environment.USERS_COLLECTION,
        [Query.equal('accountId', result.$id)]
      );

      const userData = user.total > 0 ? parseStringfy(user.documents[0]) : null;
      
      // Cache the user data
      this.currentUserCache = userData;
      
      return userData;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
  
  /**
   * Get current user as Observable for reactive programming
   */
  getCurrentUserObservable(): Observable<any> {
    return from(this.getCurrentUser()).pipe(
      catchError(error => {
        console.error('Error getting current user:', error);
        return of(null);
      })
    );
  }

  /**
   * Sign out user and clear caches
   */
  async signOut(): Promise<void> {
    try {
      await this.appwrite.account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out', error);
    } finally {
      // Clear caches when signing out
      this.currentUserCache = null;
      this.userByEmailCache.clear();
      this.appwrite.clearSession();
    }
  }
  
  /**
   * Sign out as Observable for reactive programming
   */
  signOutObservable(): Observable<void> {
    return from(this.signOut());
  }

  async signInUser(
    email: string
  ): Promise<{ accountId: string | null; error?: string }> {
    const existingUser = await this.getUserByEmail(email);

    if (existingUser) {
      await this.sendEmailOTP(email);
      return { accountId: existingUser.accountId };
    }

    return { accountId: null, error: 'User not found' };
  }
}
