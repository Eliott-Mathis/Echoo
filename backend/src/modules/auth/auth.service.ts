import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";

// Validation
import { CreateUserBody } from "./auth.schema";

export class AuthService {
  constructor(private db: PrismaClient) {}
}
