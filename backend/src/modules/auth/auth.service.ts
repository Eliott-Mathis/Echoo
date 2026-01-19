import { PrismaClient } from "../../generated/prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Resend } from "resend";


// Validation
import { CreateUserBody, LoginUserBody } from "./auth.schema";
import { HttpError } from "../../helpers/HttpError";
import { numberGenerator } from "../../helpers/Numbers";

dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY)

export class AuthService {
  constructor(private db: PrismaClient) {}

  async userExists(email: string): Promise<boolean> {
    const user = await this.db.user.findUnique({ where: {email}})
    
    return user !== null
  }

  async validJwt(token: string): Promise<any> {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini dans l'environnement");
    }

    try {
      const payload: any = jwt.verify(token, process.env.JWT_SECRET);
      return payload["email"];
    } catch (err) {
      return "";
    }
  }

  async sendVerificationMail(email: string) {
    // generate a 6 digits code
    const random = numberGenerator(6);
    
    // save code in db with email
    await this.db.userVerification.create({ data: {
      email,
      code: parseInt(random)
    }})

    // send verification mail
    const emailResponse  = await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "mathis.olaya@eduvaud.ch",
      subject: 'Echoo | Email verification',
      html: `<div style="width: 100%;">
<h1>Bienvenu dans la communauté !</h1>
<p>Validez votre compte en entrant le <strong>code</strong> ci dessous</p>
<p style="width: 100%; background-color: cornflowerblue; text-align: center; padding: 8px; color: white">${random}</p>
</div>`
    })
    
    if(emailResponse.error) throw new HttpError(500, "Une erreur est survenue")

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET non défini dans l'environnement");
    }

      // generate json web token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    
    return token;
    
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
