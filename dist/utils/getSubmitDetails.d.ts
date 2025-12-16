import type { JSONObject, SCMAction } from '../types/common.js';
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
export declare function getSubmitDetails({ payload, action, }: {
    payload: JSONObject;
    action: SCMAction;
}): SubmitDetails;
