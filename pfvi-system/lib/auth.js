import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "phone-credentials",
      name: "Phone Number Login",
      credentials: {
        phoneNumber: { label: "Phone Number", type: "string" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "boolean" },
      },
      async authorize(credentials) {
        console.log("🔑 Authorizing with credentials:", credentials);

        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new Error("Phone number and password are required");
        }

        try {
          await connectToDatabase();
          const user = await User.findOne({ phoneNumber: credentials.phoneNumber });

          if (!user) throw new Error("No user found with this phone number");
          if (user.status !== "Active") throw new Error("Account is not active.");

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isPasswordValid) throw new Error("Invalid password");

          const rememberRaw = credentials.rememberMe;
          const rememberMe = rememberRaw === true || rememberRaw === "true";

          const finalUser = {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`.trim(),
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
            rememberMe,
          };

          console.log("✅ Authorized user:", finalUser);
          return finalUser;
        } catch (error) {
          console.error("❌ Authorization error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // fallback
  },

  callbacks: {
    async jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
        token.status = user.status;
        token.rememberMe = user.rememberMe;
        token.exp = now + (user.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60); // set initial exp
        console.log("🧠 JWT callback (fresh login) →", token);
      } else {
        const remaining = (token.exp || 0) - now;
        const threshold = 10 * 60; // 10 minutes

        if (remaining < threshold) {
          const expiresIn = token.rememberMe ? 60 * 60 * 24 * 30 : 60 * 60;
          token.exp = now + expiresIn;
          console.log("🔁 JWT exp refreshed due to activity →", new Date(token.exp * 1000).toISOString());
        } else {
          console.log("🔁 JWT still valid → remaining seconds:", remaining);
        }
      }

      return token;
    },

    async session({ session, token }) {
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.phoneNumber = token.phoneNumber;
      session.user.role = token.role;
      session.user.status = token.status;
      session.user.rememberMe = token.rememberMe;
      console.log("📦 Session callback →", session.user);
      return session;
    },

    async redirect({ url, baseUrl }) {
      return url.startsWith("/") ? `${baseUrl}${url}` : baseUrl;
    },
  },

  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },

  events: {
    async signIn({ user }) {
      console.log(`👤 User signed in: ${user.phoneNumber}`);
    },
    async signOut({ token }) {
      console.log(`🚪 User signed out: ${token?.phoneNumber}`);
    },
  },

  jwt: {
    encode: async ({ token, secret }) => {
      const { exp, iat, ...cleanToken } = token;
      const expiresIn = cleanToken.rememberMe ? "30d" : "1h";
      console.log("🔐 JWT ENCODE → rememberMe:", cleanToken.rememberMe, "expiresIn:", expiresIn);
      return jwt.sign(cleanToken, secret, {
        algorithm: "HS256",
        expiresIn,
      });
    },

    decode: async ({ token, secret }) => {
      try {
        const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });
        console.log("🔓 JWT DECODE →", decoded);
        return decoded;
      } catch (err) {
        console.warn("❌ JWT decode failed:", err.message);
        return null;
      }
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

export default NextAuth(authOptions);
