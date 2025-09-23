import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      console.log('JWT callback called:', {
        hasAccount: !!account,
        hasProfile: !!profile,
        accountType: account?.type,
        profileSub: profile?.sub
      });

      // Add Google account info to token
      if (account && profile) {
        token.googleId = profile.sub
        token.email = profile.email
        token.name = profile.name
        token.picture = profile.picture
        console.log('JWT token updated with Google info:', {
          googleId: token.googleId,
          email: token.email,
          name: token.name
        });
      }
      return token
    },
    async session({ session, token }) {
      console.log('Session callback called:', {
        hasSession: !!session,
        hasToken: !!token,
        tokenGoogleId: token?.googleId,
        sessionUser: session?.user,
        tokenEmail: token?.email
      });

      // Add Google info to session
      if (token && token.googleId) {
        (session.user as any).googleId = token.googleId as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
        console.log('Session updated with user info:', {
          googleId: (session.user as any).googleId,
          email: session.user.email,
          name: session.user.name
        });
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      console.log('Redirect callback called:', { url, baseUrl });

      // If URL already starts with baseUrl, use it as-is
      if (url.startsWith(baseUrl)) return url;

      // If URL starts with /, construct full URL
      if (url.startsWith('/')) return new URL(url, baseUrl).toString();

      // Default redirect - don't force admin page for all users
      // Let the calling page handle the redirect after authentication
      return url;
    },
  },
  pages: {
    signIn: '/admin',
    error: '/admin',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: false, // Set to false for development
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, authOptions }