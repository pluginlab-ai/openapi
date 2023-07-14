import { OpenAPIV3 } from 'openapi-types';

export const ValidateForChatgptPluginErrorSeverity = [
	'error',
	'warning',
] as const;

export class ChatGptOpenApiValidationError extends Error {
	constructor(public readonly errors: ValidateForChatgptPluginError[]) {
		super(`Failed to validate OpenAPI document for ChatGPT plugin. ${errors.length} errors found.`);
	}
}

export interface ValidateForChatgptPluginOptions {
	throwOnError?: boolean;
}

export type ValidateForChatgptPluginErrorSeverity = typeof ValidateForChatgptPluginErrorSeverity[number];

export interface ValidateForChatgptPluginError {
	message: string;
	severity: ValidateForChatgptPluginErrorSeverity;
}

const validateOperationId = (opId: string): string | undefined => {
	const isValid = /^[^\s]+$/.test(opId)

	if (!isValid) {
		return `operation ID "${opId}" must is invalid. It must not contain any whitespace characters.`
	}
}

/**
 * Best effort to validate a document against mandatory rules that OpenAI enforces
*/
export const validateForChatGptPlugin = (doc: OpenAPIV3.Document, options: ValidateForChatgptPluginOptions = {}): ValidateForChatgptPluginError[] => {
	const errors = [] as ValidateForChatgptPluginError[];
	const pathEntries = Object.entries(doc.paths);

	for (const [path, pathItem] of pathEntries) {
		if (!pathItem) {
			continue;
		}

		const methods = ['get', 'post', 'put', 'delete', 'options', 'head', 'patch', 'trace'] as const;

		for (const method of methods) {
			const pathMethod = pathItem[method];

			if (pathMethod) {
				const opId = pathMethod.operationId;

				if (typeof opId !== 'string') {
					errors.push({ message: `paths.${path}.${method}.operationId must be a string`, severity: 'error' })
				} else {
					const validationError = validateOperationId(opId);

					if (validationError) {
						errors.push({ message: `paths.${path}.${method}.operationId: ${validationError}`, severity: 'error' })
					}
				}
			}
		}
	}

	if (options.throwOnError && errors.length > 0) {
		throw new ChatGptOpenApiValidationError(errors);
	}

	return errors;
}
