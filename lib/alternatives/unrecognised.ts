
/**
 * Details about the integrated content which are
 * written into the server rendered HTML for client
 * side initial state.
 */
export type UnrecognisedStateInfo = {
  iri: string;
  method: string;
  contentType: string;
};

export interface UnrecognisedIntegrationType {
  
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
   * Returns the state info used for re-constructing the fragments
   * in a DOM environment from server side rendered document.
   */
  getStateInfo(): UnrecognisedStateInfo;
};

export type UnrecognisedIntegrationArgs = {

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
};

export interface UnrecognisedIntegrationFactory {

  /**
   * The integration type this factory produces.
   */
  type: 'unrecognised';

  /**
   * The unrecogniesd integration is used internally by Octiron
   * to handle responses that have an unrecogniesd content type.
   */
  (args: UnrecognisedIntegrationArgs): UnrecognisedIntegrationType;

  /**
   * Creates a elements integration from initial state rendered into a
   * HTML document.
   *
   * @param stateInfo 
   * @param handler The content type's handler configuration.
   */
  fromInitialState(args: UnrecognisedIntegrationArgs): UnrecognisedIntegrationType;
};

export const UnrecognisedIntegration = ((
  args: UnrecognisedIntegrationArgs,
): Readonly<UnrecognisedIntegrationType> => {
  const integration: UnrecognisedIntegrationType = {
    iri: args.iri,
    method: args.method,
    contentType: args.contentType,
    getStateInfo() {
      return {
        iri: args.iri,
        method: args.method,
        contentType: args.contentType,
      };
    },
  };

  return Object.freeze(integration);
}) as UnrecognisedIntegrationFactory;

UnrecognisedIntegration.type = 'unrecognised';

UnrecognisedIntegration.fromInitialState = UnrecognisedIntegration;

