import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Validation
import { CreateUserBody } from "./auth.schema";

dotenv.config();

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

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini dans l'environnement");
    }

    // generate json web token
    const token = jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return createdUser.id;
  }
}
