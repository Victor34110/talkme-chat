'use client';

import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({

  baseURL: 'http://192.168.2.120:3001/api/auth',
});
export const { useSession, signIn, signOut, signUp } = authClient;