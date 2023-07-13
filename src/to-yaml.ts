import { OpenAPI } from "openapi-types";
import { stringify } from 'yaml';

export const toYaml = (doc: OpenAPI.Document): string => {
	return stringify(doc, { indent: 2 });
}
