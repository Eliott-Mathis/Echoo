import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";

// Validation
import { CreateUserBody } from "./auth.schema";

export class AuthService {
  constructor(private db: PrismaClient) {}

  async signUp({
    email,
    password,
    username,
    displayName,
  }: CreateUserBody): Promise<string> {
    const user = await this.db.user.findUnique({ where: { email } });
    if (user)
      throw new Error("Un utilisateur existe déjà avec cette adresse mail");

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName,
      },
    });

    return createdUser.id;
  }
}
