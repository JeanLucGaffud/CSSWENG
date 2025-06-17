import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "phone-credentials",
      name: "Phone Number Login",
      credentials: {
        phoneNumber: { 
          label: "Phone Number", 
          type: "string", 
          placeholder: "Enter your phone number" 
        },
        password: { 
          label: "Password", 
          type: "password",
          placeholder: "Enter your password"
        }
      },
      async authorize(credentials) {
        if (!credentials?.phoneNumber || !credentials?.password) {
          throw new Error("Phone number and password are required");
        }

        try {
          await connectToDatabase();
          
          // Find user by phone number
          const user = await User.findOne({ 
            phoneNumber: credentials.phoneNumber 
          });
          
          if (!user) {
            throw new Error("No user found with this phone number");
          }

          if (user.status !== 'Active') {
            throw new Error("Account is not active. Please contact an administrator.");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password, 
            user.passwordHash
          );
          
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          // Return user object
          return {
            id: user._id.toString(),
            name: `${user.firstName} ${user.lastName}`.trim(),
            phoneNumber: user.phoneNumber,
            role: user.role,
            status: user.status,
          };

        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error(error.message || "Authentication failed");
        }
      }
    })
  ],
  
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7 days session
    updateAge: 60 * 5, // Refresh if last update >5 mins ago
  },
  
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phoneNumber = user.phoneNumber;
        token.role = user.role;
        token.status = user.status;
        token.lastUpdate = Math.floor(Date.now() / 1000);
        return token;
      }
      
      if (trigger === "update") {
        token.lastUpdate = Math.floor(Date.now() / 1000);
        return { ...token, ...session };
      }
      
      // Auto refresh token
      const now = Math.floor(Date.now() / 1000);
      if (token.lastUpdate && (now - token.lastUpdate > 60 * 5)) {
        token.lastUpdate = now;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Add user data to session object
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.phoneNumber = token.phoneNumber;
        session.user.role = token.role;
        session.user.status = token.status;
        
        // session expiration
        session.expires = new Date(
          (token.lastUpdate || token.iat || Math.floor(Date.now() / 1000)) * 1000 + 60 * 60 * 1000
        ).toISOString();
      }
      
      return session;
    },
    
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  
  events: {
    async signIn({ user }) {
      console.log(`User signed in: ${user.phoneNumber}`);
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token?.phoneNumber}`);
    }
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

export default NextAuth(authOptions);