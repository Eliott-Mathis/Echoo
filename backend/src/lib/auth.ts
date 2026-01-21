import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { Resend } from "resend";
import { PrismaClient } from "../generated/prisma/client";

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = (prisma: PrismaClient = new PrismaClient()) => betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: [process.env.CLIENT_ORIGIN ?? "http://localhost:5173"],
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  user: {
    modelName: "User",
    fields: {
      name: "displayName",
      email: "email",
      emailVerified: "isVerified",
      image: "avatarUrl",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
    additionalFields: {
      username: { type: "string", required: true },
      birthDate: { type: "date", required: true },
    },
  },
  account: {
    modelName: "Account",
  },
  session: {
    modelName: "Session",
  },
  verification: {
    modelName: "Verification",
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      sendVerificationOTP: async ({
        email,
        otp,
        type,
      }: {
        email: string;
        otp: string;
        type: "sign-in" | "email-verification" | "forget-password";
      }) => {
        console.log(`[OTP] ===== FUNCTION CALLED =====`);
        console.log(`[OTP] Sending code ${otp} to ${email} (type: ${type})`);
        console.log(`[OTP] RESEND_API_KEY present: ${!!process.env.RESEND_API_KEY}`);
        
        const subjectMap: Record<string, string> = {
          "email-verification": "Echoo | Email verification",
          "sign-in": "Echoo | Sign in code",
          "forget-password": "Echoo | Reset password",
        };
        
        try {
          const response = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: subjectMap[type] ?? "Echoo | Verification code",
            html: `<div style="width: 100%;">
<h1>Bienvenue dans la communauté !</h1>
<p>Votre code est :</p>
<p style="width: 100%; background-color: cornflowerblue; text-align: center; padding: 8px; color: white">${otp}</p>
</div>`,
          });

          console.log("[OTP] Resend response:", JSON.stringify(response));

          if (response.error) {
            console.error("[OTP] Resend error:", response.error);
          }
          
          console.log(`[OTP] Email sent successfully to ${email}`);
        } catch (error) {
          console.error("[OTP] Resend send failed:", error);
        }
      },
    }),
  ],
});
