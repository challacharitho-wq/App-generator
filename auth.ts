import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const [{ compare }, { getPrismaClient }] = await Promise.all([
          import("bcryptjs"),
          import("@/lib/prisma"),
        ]);
        const prisma = getPrismaClient();
        const email = typeof credentials?.email === "string" ? credentials.email.toLowerCase().trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";

        if (!email || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          return null;
        }

        const isValidPassword = await compare(password, user.password);

        if (!isValidPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user?.id);
    },
    jwt({ token, user }) {
      const authToken = token as typeof token & { id?: string; email?: string | null };

      if (user) {
        authToken.id = user.id;
        authToken.email = user.email ?? null;
      }

      return authToken;
    },
    session({ session, token }) {
      const authToken = token as typeof token & { id?: string; email?: string | null };

      session.user = {
        ...session.user,
        id: String(authToken.id ?? ""),
        email: authToken.email ?? "",
      };

      return session;
    },
  },
});
