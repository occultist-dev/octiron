import type {Handler} from '../types/store.ts';


export const problemDetailsJSONHandler: Handler = {
  integrationType: 'problem-details',
  contentType: 'application/problem+json',
  handler: async ({ res }) => {
    return res.json();
  },
}
