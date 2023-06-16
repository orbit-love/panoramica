import { withAuth } from "next-auth/middleware";

// More on how NextAuth.js middleware works: https://next-auth.js.org/configuration/nextjs#middleware
export default withAuth({
  callbacks: {
    authorized({ token }) {
      // requires the user to be logged in
      return !!token;
    },
  },
});

export const config = { matcher: ["/"] };
