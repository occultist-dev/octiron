import type {Children} from "mithril";
import type {ErrorView, IntegrationState} from "../types/store.ts";


export type UnrecognizedStateInfo = {
  iri: string;
  method: string;
  contentType: string;
};

export type UnrecognizedIntegrationArgs = {
  iri: string;
  method: string;
  contentType: string;
};

/**
 * Handles all responses where the content type is not
 * configured.
 */
export class UnrecognizedIntegration implements IntegrationState {
  static type = 'unrecognized' as const;
  readonly integrationType = 'unrecognized' as const

  #iri: string;
  #method: string;
  #contentType: string;
  
  constructor(args: UnrecognizedIntegrationArgs) {
    this.#iri = args.iri;
    this.#method = args.method;
    this.#contentType = args.contentType;
  }

  public error(view: Children | ErrorView) {
    if (typeof view === 'function') {
      return view({ type: 'unrecognized-content-type' });
    }

    return view;
  }

  get iri(): string {
    return this.#iri;
  }

  get method(): string {
    return this.#method;
  }

  get contentType(): string {
    return this.#contentType;
  }

  public getStateInfo(): UnrecognizedStateInfo {
    return {
      iri: this.#iri,
      method: this.#method,
      contentType: this.#contentType,
    };
  }

  static fromInitialState({
    iri,
    method,
    contentType,
  }: UnrecognizedStateInfo) {
    return new UnrecognizedIntegration({ iri, method, contentType });
  }

}
