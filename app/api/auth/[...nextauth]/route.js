import NextAuth from "next-auth";
import { authOptions } from "src/auth/nextAuthOptions";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
