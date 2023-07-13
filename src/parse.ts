import { OpenAPIV3 } from 'openapi-types';
import { parse as parseYaml } from 'yaml';

export const OpenapiFormats = [
	'yaml',
	'json'
] as const;

export type OpenapiFormat = typeof OpenapiFormats[number]

export interface ParseResult<DocType = OpenAPIV3.Document> {
	format: OpenapiFormat;
	doc: DocType;
}

export class InvalidOpenapiDocumentError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidOpenapiDocumentError";
	}
}

/**
 * Performs a lax validation of the OpenAPI document.
 * This function will throw if crucial fields are missing.
 * Proper JSON schema validation can be added if needed, but OpenAI is not very strict about the document structure
 * and don't enforce much.
 * Most of the plugins listed in the store have an invalid spec if validated with the official OpenAPI schema
 * Mostly taken and rehabilitated from there: https://github.com/APIDevTools/swagger-parser/blob/803ff45cfccfaa30ce905c65ab573513f57c3254/lib/index.js#L58C1-L59C1
 */ 
const checkOpenApiV3DocumentIntegrity = (doc: any): OpenAPIV3.Document => {
	const supportedVersions = ["3.0.0", "3.0.1", "3.0.2", "3.0.3", "3.1.0"];

	if (doc.openapi === undefined) {
		throw new InvalidOpenapiDocumentError(`Missing "openapi" field in document`);
	}

	if (doc.info === undefined) {
		throw new InvalidOpenapiDocumentError(`Missing "info" field in document`);
	}

 	if (doc.paths === undefined) {
		if (doc.openapi === "3.1.0") {
			if (doc.webhooks === undefined) {
				throw new InvalidOpenapiDocumentError(`No "paths" field, openapi version is 3.1.0, but no "webhooks" field in document`);
			}
		}
		else {
			throw new InvalidOpenapiDocumentError(`No "paths" field in document`);
		}
	}

	if (typeof doc.openapi === "number") {
		// This is a very common mistake, so give a helpful error message
		throw new InvalidOpenapiDocumentError('Openapi version number must be a string (e.g. "3.0.0") not a number.');
	}

	if (typeof doc.info.version === "number") {
		// This is a very common mistake, so give a helpful error message
		throw new InvalidOpenapiDocumentError('API version number must be a string (e.g. "1.0.0") not a number.');
	}

	if (supportedVersions.indexOf(doc.openapi) === -1) {
          throw new InvalidOpenapiDocumentError(
            `Unsupported OpenAPI version: ${doc.openapi}. ` +
            `This package only supports versions ${supportedVersions.join(", ")}`
          );
        }

	return doc;
}

/*
 * Parses an OpenAPI document from a string.
 * Best effort is made to detect the format, but if it fails, it will throw.
 * Accepted formats are JSON and YAML.
 * Basic integirty checks are performed on the document, but no actual JSON schema validation is performed. This is probably what you want
 * since OpenAI does not enforce much when it comes to respecting the document structure.
 * @param str The stringified openapi specification. If looking for a way to parse an object, use parseFromObject.
 * @returns A promise that resolves to the parsed document.
*/
export const parseFromString = (str: string): ParseResult => {
	let unvalidatedDocument: any | null = null;
	let format: OpenapiFormat = 'json';

	try {
		unvalidatedDocument = JSON.parse(str);
		format = 'json'
	} catch (e) {}

	if (!unvalidatedDocument) {
		try {
			unvalidatedDocument = parseYaml(str);
			format = 'yaml'
		} catch (e) {}
	}

	if (!unvalidatedDocument) {
		throw new Error('Could not parse provided document. Is it valid JSON or YAML?');
	}

	const doc = checkOpenApiV3DocumentIntegrity(unvalidatedDocument);

	return { format, doc };
}

export const parseFromObject = async (json: any): Promise<ParseResult> => {
	const doc = checkOpenApiV3DocumentIntegrity(json);

	return { format: 'json', doc };
}
