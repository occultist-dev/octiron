import type {Handler} from '../types/store.js';


export const problemDetailsJSONHandler: Handler = {
  integrationType: 'problem-details',
  contentType: 'application/problem+json',
  handler: async ({ res }) => {
    return res.json();
  },
}
