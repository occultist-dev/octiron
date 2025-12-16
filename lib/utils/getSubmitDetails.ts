import uriTemplates from 'uri-templates';
import type { JSONObject, SCMAction } from '../types/common.js';
import { isJSONObject } from './isJSONObject.js';
import { isTypeObject } from "./isTypedObject.js";


export type SubmitDetails = {
  url: string;
  method: string;
  contentType?: string;
  encodingType?: string;
  body?: string;
};

/**
 * Gets the details on how to perform a submission
 * based off an action, payload and other context.
 *
 * @param args.payload The current payload value.
 * @param args.action The schema.org styled action object.
 */
export function getSubmitDetails({
  payload,
  action,
}: {
  payload: JSONObject;
  action: SCMAction;
}): SubmitDetails {
  let urlTemplate: string | undefined;
  let body: string | undefined;
  let method: string = 'get';
  let contentType: string | undefined;
  let encodingType: string | undefined;
  let target = action['https://schema.org/target'];

  if (Array.isArray(target)) {
    for (const item of target) {
      if (item === 'string') {
        target = item;
        break;
      } else if (
        isJSONObject(target) && (
          target['https://schema.org/contentType'] == null || (
            target['https://schema.org/contentType'] === 'mutipart/form-data' ||
            target['https://schema.org/contentType'] === 'application/ld+json'
          )
        )
      ) {
        target = item;
        break;
      }
    }
  }

  if (typeof target === 'string') {
    urlTemplate = target;
  } else if (isJSONObject(target)) {
    if (typeof target['https://schema.org/urlTemplate'] === 'string') {
      urlTemplate = target['https://schema.org/urlTemplate'];
    }

    if (typeof target['https://schema.org/httpMethod'] === 'string') {
      method = target['https://schema.org/httpMethod'].toLowerCase();
    }

    if (typeof target['https://schema.org/contentType'] === 'string') {
      contentType = target['https://schema.org/contentType'];
    }

    if (typeof target['https://schema.org/encodingType'] === 'string') {
      encodingType = target['https://schema.org/encodingType'];
    }
  }

  if (typeof urlTemplate !== 'string') {
    throw new Error('Action has invalid https://schema.org/target');
  }

  const fillArgs: JSONObject = {};

  const submitBody = Object.assign({}, payload);

  for (const [type, value] of Object.entries(action)) {
    if (!isTypeObject(value) ||
        value['@type'] !== 'https://schema.org/PropertyValueSpecification') {
      continue;
    }

    const valueName = value['https://schema.org/valueName'] as string;

    if (valueName != null) {
      const propType = type.replace(/-input$/, '');

      fillArgs[valueName] = payload[propType];
      delete submitBody[valueName];
    }
  }

  const template = uriTemplates(urlTemplate);

  // deno-lint-ignore no-explicit-any
  const url: string = template.fill(fillArgs as any);

  // only add body if supporting HTTP method
  if (method !== 'get' && method !== 'delete') {
    body = JSON.stringify(submitBody);
  } else {
    contentType = undefined
    encodingType = undefined
  }

  return {
    url,
    method,
    contentType,
    encodingType,
    body,
  };
}
