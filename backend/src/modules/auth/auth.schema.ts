import { JSONSchemaType } from "ajv";

export interface CreateUserBody {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

export const createUserSchema: JSONSchemaType<CreateUserBody> = {
  type: "object",
  properties: {
    email: { type: "string", format: "email" as const, nullable: false },
    password: { type: "string", minLength: 8, nullable: false },
    username: { type: "string", nullable: false },
    displayName: { type: "string", nullable: false },
  },
  required: ["email", "password", "username", "displayName"],
  additionalProperties: false,
};
