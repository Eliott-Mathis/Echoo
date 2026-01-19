import { FastifyInstance } from "fastify";
import { JSONSchemaType } from "ajv";
import { auth } from "../../lib/auth";
import { HttpError } from "../../helpers/HttpError";
import bcrypt from "bcrypt";

interface CompleteSignupBody {
  email: string;
  code: string;
  password: string;
  username: string;
  displayName: string;
  birthDate: string;
}

interface CheckOtpBody {
  email: string;
  code: string;
}

const completeSignupSchema: JSONSchemaType<CompleteSignupBody> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
    code: { type: "string", minLength: 4, nullable: false },
    password: { type: "string", minLength: 8, nullable: false },
    username: { type: "string", minLength: 3, nullable: false },
    displayName: { type: "string", minLength: 2, nullable: false },
    birthDate: { type: "string", format: "date", nullable: false },
  },
  required: ["email", "code", "password", "username", "displayName", "birthDate"],
  additionalProperties: false,
};

const checkOtpSchema: JSONSchemaType<CheckOtpBody> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
    code: { type: "string", minLength: 4, nullable: false },
  },
  required: ["email", "code"],
  additionalProperties: false,
};

const verifySignupOtp = async (
  db: FastifyInstance["db"],
  email: string,
  code: string
) => {
  const normalizedEmail = email.toLowerCase();
  const identifier = `sign-in-otp-${normalizedEmail}`;

  const verification = await db.verification.findUnique({
    where: { identifier },
  });

  if (!verification) {
    throw new HttpError(400, "Invalid verification code");
  }

  if (verification.expiresAt < new Date()) {
    await db.verification.delete({ where: { id: verification.id } });
    throw new HttpError(400, "OTP expired");
  }

  const value = verification.value ?? "";
  const lastColon = value.lastIndexOf(":");
  const storedOtp = lastColon >= 0 ? value.slice(0, lastColon) : value;
  const attempts = lastColon >= 0 ? parseInt(value.slice(lastColon + 1) || "0", 10) : 0;
  const allowedAttempts = 3;

  if (attempts >= allowedAttempts) {
    await db.verification.delete({ where: { id: verification.id } });
    throw new HttpError(403, "Too many attempts");
  }

  if (storedOtp !== code) {
    await db.verification.update({
      where: { id: verification.id },
      data: { value: `${storedOtp}:${attempts + 1}` },
    });
    throw new HttpError(400, "Invalid verification code");
  }

  await db.verification.delete({ where: { id: verification.id } });
};

export default async function signupRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: CheckOtpBody }>(
    "/check-otp",
    { schema: { body: checkOtpSchema } },
    async (request, reply) => {
      const { email, code } = request.body;
      await verifySignupOtp(fastify.db, email, code);
      reply.code(200).send({ ok: true });
    }
  );

  fastify.post<{ Body: CompleteSignupBody }>(
    "/complete-signup",
    { schema: { body: completeSignupSchema } },
    async (request, reply) => {
      const { email, code, password, username, displayName, birthDate } = request.body;

      await verifySignupOtp(fastify.db, email, code);

      const response = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name: displayName,
          username,
          birthDate: new Date(birthDate),
        },
        asResponse: true,
      });

      const hashedPassword = await bcrypt.hash(password, 10);
      await fastify.db.user.update({
        where: { email },
        data: { isVerified: true, password: hashedPassword, username, displayName },
      });

      reply.status(response.status);
      response.headers.forEach((value: string, key: string) => reply.header(key, value));
      reply.send(response.body ? await response.text() : null);
    }
  );
}
