import { OpenAPI } from "openapi-types";

export const toJson = (doc: OpenAPI.Document) => JSON.stringify(doc, null, 2);
