import NextAuth, { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from 'bcrypt';
import prisma from "@/lib/prisma";


console.log(prisma);

// Extend NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
  }
  
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken?: string;
    refreshToken?: string;
  }
}



// 
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? "✓ Loaded" : "✗ Missing");
console.log("GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✓ Loaded" : "✗ Missing");
console.log("DB:", process.env.DATABASE_URL ? process.env.DATABASE_URL : "✗ Missing");

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    Credentials({
      name: 'Credentials',
      credentials : {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com",required : true },
        password: { label: "Password", type: "password", required: true }
      },
      async authorize(credentials, req) {
      try {
        console.log(credentials?.email , " ", credentials?.password);
        const existingUser = await prisma.users.findUnique({
          where: { email: credentials?.email! },
          select: { id: true,
            name: true,
            email : true,
            password : true,
            imagelink: true }
        });
        
       
        if (existingUser && existingUser.password) {
          if(await bcrypt.compare(credentials?.password!,existingUser.password)){
            return {
          id: existingUser.id.toString(),
          name: existingUser.name,
          email: existingUser.email,
          image: existingUser.imagelink,
        };
          }
          else return null;
          
        }
         const hashedPassword = await bcrypt.hash(credentials?.password!,10);
        const newUser = await prisma.users.create({
          data: {
            name: "Unknown",
            email: credentials?.email!,
            accountProvider: "credentials",
            password : hashedPassword,
            imagelink : ""
          },
          select: {
            id: true,
            name: true,
            email : true,
            imagelink: true
          }
        });
        return {
          id: newUser.id.toString(),
          name: newUser.name,
          email: newUser.email,
          image: newUser.imagelink,
        };
      }
      catch(e){
        console.log(e);
        return null;
    }

    }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // console.log('Sign in:', { user, account, profile })
      try {
        // Check if user already exists
        const existingUser = await prisma.users.findUnique({
          where: { email: user.email! },
          select: { id: true }
        });

        if (existingUser) {
          // User exists, store the ID for later use
          user.id = existingUser.id.toString();
          return true;
        }

        // Create new user if doesn't exist
        const newUser = await prisma.users.create({
          data: {
            name: user.name || "Unknown",
            email: user.email!,
            accountProvider: account?.provider || "Google",
            imagelink: user.image
          },
          select: {
            id: true,
            name: true,
            imagelink: true
          }
        });

        // Store the database user ID in the user object
        user.id = newUser.id.toString();
        
        return true;
      } catch (e) {
        console.log('Error in signIn callback:', e);
        return false; // Reject sign in on error
      }
    },
    
    async jwt({ token, user, account }) {
      // Called whenever JWT is accessed
      // Save user info to token on first sign in
      if (user) {
        token.id = user.id; // This will now be the database user ID
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }
      
      // Save access token if available
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      
      return token;
    },
    
    async session({ session, token }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = token.id as string; // Database user ID
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
      }
      (session as any).accessToken = token.accessToken;
      
      return session;
    }
  },
}