
export type ProblemStateInfo = {
  iri: string;
  method: string;
  contentType: string;
  integrationType: 'problem';
  content: Problem;
};

export type Problem = Record<string, unknown> & {

  /**
   * A URI references that identifies the problem type.
   */
  type?: string;

  /**
   * A short human-readable summary of the problem type.
   */
  title?: string;

  /**
   * A human-readable explanation specific to this occurrence of the problem.
   */
  detail?: string;
  
  /**
   * A URI reference that identifies the specific occurrence of the problem.
   */
  instance?: string;

  /**
   * A JSON Pointer locating the payload member which this problem relates to.
   */
  pointer?: string;

  /**
   * A list of problems detailing issues in the request's payload's members.
   */
  errors?: Problem[];
};

export type ProblemHandlerFnArgs = {
  res: Response;
};

/**
 * Function that returns a problem details response body as a JSON object.
 *
 * @param args Problem handler args.
 */
export type ProblemHandlerFn = (args: ProblemHandlerFnArgs) => Promise<Problem>;

export type ProblemHandler = {
  
  /**
   * The Handler's integration type.
   */
  integrationType: 'problem',

  /**
   * The response content type handled by this handler.
   */
  contentType: string;

  /**
   * Function that returns a problem details response body as a JSON object.
   * 
   * If not provided the response body will be parsed as JSON.
   *
   * @param args Problem handler args.
   */
  handler?: ProblemHandlerFn;
};

export type ProblemIntegrationArgs = {

  /**
   * The IRI of the content.
   */
  iri: string;

  /**
   * The HTTP method used to retrieve the content.
   */
  method: string;

  /**
   * The HTTP content type.
   */
  contentType: string;

  /**
   * The processed content.
   */
  content: Problem;
};

export interface ProblemIntegrationType {

  /**
   * The IRI of the content.
   */
  iri: string;

  /**
   * The HTTP method used to retrieve the content.
   */
  method: string;

  /**
   * The HTTP content type.
   */
  contentType: string;

  /**
   * The Octiron integration type.
   */
  integrationType: 'problem';

  /**
   * The response problem object.
   */
  problem: Problem;

  /**
   * Returns the state info used for re-constructing the element
   * in a DOM environment from server side rendered document.
   */
  getStateInfo(): ProblemStateInfo;

}

export interface ProblemIntegrationFactory {

  type: 'problem';

  /**
   * The problem integration is designed to be used for failing responses
   * using the media-types "application/problem+json" and "application/problem+xml".
   *
   * The values parsed from the response are made available on the Octiron instance('s)
   * which reference the failed response via the `o.problem` object.
   *
   * For Octiron actions with problems relating to deeply nested editable selections
   * any values in the problem error value will be mapped to the selections using the
   * nested problem's pointer.
   *
   * @param args The fragments integration args.
   * @param handler The content type's handler configuration.
   */
  (args: ProblemIntegrationArgs, handler: ProblemHandler): ProblemIntegrationType;

  /**
   * Creates a problem integration from initial state.
   *
   * @param stateInfo 
   * @param handler The content type's handler configuration.
   */
  fromInitialState(stateInfo: ProblemStateInfo, handler: ProblemHandler): ProblemIntegrationType;
};

export const ProblemIntegration = ((
  args: ProblemIntegrationArgs,
): Readonly<ProblemIntegrationType> => {
  if (Array.isArray(args.content.errors)) {
    for (let i = 0, l = args.content.errors.length; i < l; i++) {
      Object.freeze(args.content.errors[i]);
    }
  }

  const integration: ProblemIntegrationType = {
    iri: args.iri,
    method: args.method,
    contentType: args.contentType,
    integrationType: 'problem',
    problem: Object.freeze(args.content),
    getStateInfo() {
      return {
        integrationType: 'problem',
        iri: args.iri,
        method: args.iri,
        contentType: args.contentType,
        content: args.content,
      };
    },
  };

  return Object.freeze(integration);
}) as unknown as ProblemIntegrationFactory;

ProblemIntegration.type = 'problem';

ProblemIntegration.fromInitialState = ProblemIntegration;

