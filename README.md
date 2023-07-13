<p align="center">
<a href="https://www.pluginlab.ai">
  <img width="250" height="250" src="https://uploads-ssl.webflow.com/6446ea87f99b6dc7c2e8c9cb/64470266b86f5166fd19a752_white-logo.svg">
  </a>
</p>

Want to get users and start making money out of your ChatGPT plugin? Check out [pluginlab.ai](https://www.pluginlab.ai) !


# Openapi

Simple openapi parser and validator with first class support for both JSON and YAML specifications.

## Installation

Install the package:

```bash
npm install --save @pluginlab/openapi
```

# Getting started

## Parse OAS from string (yaml/json)

```typescript
import { parseFromString, toYaml } from "@pluginlab/openapi";

const yaml = `
openapi: 3.0.0
info:
  title: Sample API
  description: Optional multiline or single-line description in [CommonMark](http://commonmark.org/help/) or HTML.
  version: 0.1.9
servers:
  - url: http://api.example.com/v1
    description: Optional server description, e.g. Main (production) server
  - url: http://staging-api.example.com
    description: Optional server description, e.g. Internal staging server for testing
paths:
  /users:
    get:
      summary: Returns a list of users.
      description: Optional extended description in CommonMark or HTML.
      responses:
        '200':    # status code
          description: A JSON array of user names
          content:
            application/json:
              schema:
                type: array
                items:
                  type: string

`

const { format, doc } = await parseFromString(yaml);

console.log({ format, doc })
```

Also supports JSON through the use of the same parse function:

```typescript
import { parseFromString, toJson, toYaml } from "@pluginlab/openapi"; 

const json = `
{
  "openapi": "3.0.0",
  "info": {
    "title": "Sample API",
    "description": "Optional multiline or single-line description in [CommonMark](http://commonmark.org/help/) or HTML.",
    "version": "0.1.9"
  },
  "servers": [
    {
      "url": "http://api.example.com/v1",
      "description": "Optional server description, e.g. Main (production) server"
    },
    {
      "url": "http://staging-api.example.com",
      "description": "Optional server description, e.g. Internal staging server for testing"
    }
  ],
  "paths": {
    "/users": {
      "get": {
        "summary": "Returns a list of users.",
        "description": "Optional extended description in CommonMark or HTML.",
        "responses": {
          "200": {
            "description": "A JSON array of user names",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "type": "string"
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}

`

const { format, doc } = parseFromString(json);

console.log(doc)
```

## Transform spec to another format

This package provides to utilities `toJson` and `toYaml` to convert a parsed spec to respectively stringified JSON or YAML.

```typescript
import { toYaml, toJson, parseFromString } from '@pluginlab/openapi'
import { readFileSync } from 'fs'

const file = readFileSync('./openapi.json', 'utf-8');
const { doc } = parseFromString(file);
const yaml = toYaml(doc);
const json = toJson(doc);

console.log(yaml);
console.log(json);
```
