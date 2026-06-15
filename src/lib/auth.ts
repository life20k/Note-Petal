import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        tenantSlug: { label: "Tenant", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const slug = credentials.tenantSlug as string | undefined;

        let user;
        let tenant;

        if (slug) {
          tenant = await prisma.tenant.findUnique({
            where: { slug },
          });
          if (!tenant) return null;

          user = await prisma.user.findFirst({
            where: {
              tenantId: tenant.id,
              email: credentials.email as string,
            },
          });
        } else {
          user = await prisma.user.findFirst({
            where: { email: credentials.email as string },
            include: { tenant: true },
          });
          if (user) {
            tenant = await prisma.tenant.findUnique({
              where: { id: user.tenantId },
            });
          }
        }

        if (!user || !tenant) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: tenant.id,
          tenantSlug: tenant.slug,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.tenantId = (user as any).tenantId;
        token.tenantSlug = (user as any).tenantSlug;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).tenantId = token.tenantId;
        (session.user as any).tenantSlug = token.tenantSlug;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
});
