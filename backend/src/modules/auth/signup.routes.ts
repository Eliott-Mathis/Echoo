import { FastifyInstance } from 'fastify';
import { JSONSchemaType } from 'ajv';
import { HttpError } from '../../helpers/HttpError';
import bcrypt from 'bcrypt';

const DEFAULT_AVATARS = ['Blue.svg', 'Yellow.svg', 'Red.svg', 'Purple.svg', 'Orange.svg', 'Green.svg'];

const getDefaultAvatarUrl = () => {
  const base = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
  const pick = DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)];
  return `${base}/defaultpfps/${pick}`;
};

interface CompleteSignupBody {
  email: string;
  code: string;
  password: string;
  username: string;
  displayName: string;
  birthDate: string;
}

const completeSignupSchema: JSONSchemaType<CompleteSignupBody> = {
  type: 'object',
  properties: {
    email: { type: 'string', format: 'email' as const, nullable: false },
    code: { type: 'string', minLength: 4, nullable: false },
    password: { type: 'string', minLength: 8, nullable: false },
    username: { type: 'string', minLength: 3, nullable: false },
    displayName: { type: 'string', minLength: 2, nullable: false },
    birthDate: { type: 'string', format: 'date', nullable: false },
  },
  required: ['email', 'code', 'password', 'username', 'displayName', 'birthDate'],
  additionalProperties: false,
};

const verifySignupOtp = async (db: FastifyInstance['db'], email: string, code: string) => {
  const normalizedEmail = email.toLowerCase();
  const identifier = `sign-in-otp-${normalizedEmail}`;

  const verification = await db.verification.findUnique({
    where: { identifier },
  });

  if (!verification) {
    throw new HttpError(400, 'Invalid verification code');
  }

  if (verification.expiresAt < new Date()) {
    await db.verification.delete({ where: { id: verification.id } });
    throw new HttpError(400, 'OTP expired');
  }

  const value = verification.value ?? '';
  const lastColon = value.lastIndexOf(':');
  const storedOtp = lastColon >= 0 ? value.slice(0, lastColon) : value;
  const attempts = lastColon >= 0 ? parseInt(value.slice(lastColon + 1) || '0', 10) : 0;
  const allowedAttempts = 3;

  if (attempts >= allowedAttempts) {
    await db.verification.delete({ where: { id: verification.id } });
    throw new HttpError(403, 'Too many attempts');
  }

  if (storedOtp !== code) {
    await db.verification.update({
      where: { id: verification.id },
      data: { value: `${storedOtp}:${attempts + 1}` },
    });
    throw new HttpError(400, 'Invalid verification code');
  }

  await db.verification.delete({ where: { id: verification.id } });
};

export default async function signupRoutes(fastify: FastifyInstance) {
  // Check if email is already taken
  fastify.post<{ Body: { email: string } }>(
    '/check-email',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
          },
          required: ['email'],
        },
      },
    },
    async (request, reply) => {
      const { email } = request.body;
      const existingUser = await fastify.db.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      return reply.send({ exists: !!existingUser });
    }
  );

  fastify.post<{ Body: CompleteSignupBody }>('/complete-signup', { schema: { body: completeSignupSchema } }, async (request, reply) => {
    const { email, code, password, username, displayName, birthDate } = request.body;

    await verifySignupOtp(fastify.db, email, code);

    const response = await fastify.auth.api.signUpEmail({
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
    const existingUser = await fastify.db.user.findUnique({
      where: { email },
      select: { avatarUrl: true },
    });
    const avatarUrl = existingUser?.avatarUrl ?? getDefaultAvatarUrl();
    await fastify.db.user.update({
      where: { email },
      data: { isVerified: true, password: hashedPassword, username, displayName, avatarUrl },
    });

    reply.status(response.status);
    response.headers.forEach((value: string, key: string) => reply.header(key, value));
    reply.send(response.body ? await response.text() : null);
  });
}
