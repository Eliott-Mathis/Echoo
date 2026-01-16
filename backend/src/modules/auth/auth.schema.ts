import { JSONSchemaType } from "ajv";

export interface CreateUserBody {
  email: string;
  password: string;
  username: string;
  displayName: string;
  birthDate: string;
}

export const createUserSchema: JSONSchemaType<CreateUserBody> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
    password: { type: "string", minLength: 8, nullable: false },
    username: { type: "string", nullable: false },
    displayName: { type: "string", nullable: false },
    birthDate: {type: "string", format: "date", nullable: false}
  },
  required: ["email", "password", "username", "displayName", "birthDate"],
  additionalProperties: false,
};

export interface SendValidationCodeToEmail {
  email: string;
}

export const sendValidationCodeSchema: JSONSchemaType<SendValidationCodeToEmail> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
  },
  required: ["email"],
  additionalProperties: false
}

export interface LoginUserBody {
  email: string;
  password: string;
}

export const loginUserSchema: JSONSchemaType<LoginUserBody> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
    password: { type: "string", nullable: false },
  },
  required: ["email", "password"],
  additionalProperties: false,
};
