import { OpenAPIV3 } from 'openapi-types'
import { OpenapiFormat } from './parse'
import { toJson } from './to-json'
import { toYaml } from './to-yaml'

export const stringify = (doc: OpenAPIV3.Document, format: OpenapiFormat) => {
	return format === 'json' ? toJson(doc) : toYaml(doc)
}
