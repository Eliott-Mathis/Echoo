import type { FastifyRequest } from "fastify";

export const fastifyHeadersToFetchHeaders = (
  headers: FastifyRequest["headers"]
) => {
  const mapped = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined) return;

    if (Array.isArray(value)) {
      for (const v of value) mapped.append(key, v.toString());
      return;
    }

    mapped.append(key, value.toString());
  });

  return mapped;
};

export const fastifyUrlToAbsoluteUrl = (request: FastifyRequest) => {
  const host = request.headers.host;
  const base = host ? `http://${host}` : "http://localhost";
  return new URL(request.url, base);
};

export const fastifyToFetchRequest = (request: FastifyRequest) => {
  const url = fastifyUrlToAbsoluteUrl(request);
  const headers = fastifyHeadersToFetchHeaders(request.headers);

  return new Request(url.toString(), {
    method: request.method,
    headers,
    ...(request.body ? { body: JSON.stringify(request.body) } : {}),
  });
};
