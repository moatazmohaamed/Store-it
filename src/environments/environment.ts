export const environment = {
  production: false,
  appwriteEndpoint: 'https://fra.cloud.appwrite.io/v1',
  appwriteProjectId: '6890e4a5003958eee8ab',
  DATABASE_ID: '6890e7040004b935499b',
  USERS_COLLECTION: '6890e73a003c0b2fc141',
  FILES_COLLECTION: '6890e7ab002e98d144be',
  BUCKET_STORAGE: '6890e899001590bcf403',
  // Secret key should not be exposed in client-side code
  // Use environment variables or a secure backend service instead
  SECRET_KEY: process.env['APPWRITE_SECRET_KEY'] || '',
};
