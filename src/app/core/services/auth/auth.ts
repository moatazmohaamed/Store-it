import { inject, Injectable } from '@angular/core';
import { ID, Query } from 'appwrite';
import { Appwrite } from '../appwrite/appwrite';
import { environment } from '../../../../environments/environment.production';
import {
  avatarPlaceholderUrl,
  parseStringfy,
} from '../../../shared/utils/utils';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  appwrite = inject(Appwrite);
  toastr = inject(ToastrService);
  constructor() {}

  async getUserByEmail(email: string): Promise<any> {
    try {
      const result = await this.appwrite.databases.listDocuments(
        environment.DATABASE_ID,
        environment.USERS_COLLECTION,
        [Query.equal('email', [email])]
      );
      return result.total > 0 ? result.documents[0] : null;
    } catch (error) {
      console.error('Error fetching user', error);
      return null;
    }
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

  async getCurrentUser(): Promise<any> {
    try {
      const result = await this.appwrite.account.get();

      const user = await this.appwrite.databases.listDocuments(
        environment.DATABASE_ID,
        environment.USERS_COLLECTION,
        [Query.equal('accountId', result.$id)]
      );

      return user.total > 0 ? parseStringfy(user.documents[0]) : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.appwrite.account.deleteSession('current');
    } catch (error) {
      console.error('Error signing out', error);
    } finally {
      this.appwrite.clearSession();
    }
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
