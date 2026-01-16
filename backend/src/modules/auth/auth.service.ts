import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// Validation
import { CreateUserBody, LoginUserBody } from "./auth.schema";
import { HttpError } from "../../helpers/HttpError";

dotenv.config();

export class AuthService {
  constructor(private db: PrismaClient) {}

  async userExists(email: string): Promise<boolean> {
    const user = await this.db.user.findUnique({ where: {email}})
    return user !== null
  }

  async signUp({
    email,
    password,
    username,
    displayName,
    birthDate
  }: CreateUserBody): Promise<string> {
    const user = await this.db.user.findUnique({ where: { email } });
    if (user) throw new HttpError(400, "Un utilisateur existe déjà avec cette adresse mail");

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.db.user.create({
      data: {
        email,
        password: hashedPassword,
        username,
        displayName,
        birthDate: new Date(birthDate)
      },
    });

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini dans l'environnement");
    }

    // generate json web token
    const token = jwt.sign({ id: createdUser.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return token;
  }

  async login({email, password}: LoginUserBody): Promise<string> {
    const user = await this.db.user.findUnique({ where: {email}})
    if (!user) throw new HttpError(404, "Identifiants incorrectes")

    // compare both password
    const res = await bcrypt.compare(password, user.password);
    if(!res) throw new HttpError(404, "Identifiants incorrectes")

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini dans l'environnement");
    }

    // generate json web token
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    return token
  }
}
