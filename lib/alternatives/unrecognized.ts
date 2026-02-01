import {Children} from "mithril";
import type {ErrorView, IntegrationState} from "../types/store.js";


export type UnrecognizedStateInfo = {
  iri: string;
  contentType: string;
};

export type UnrecognizedIntegrationArgs = {
  iri: string;
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
  #contentType: string;
  
  constructor(args: UnrecognizedIntegrationArgs) {
    this.#iri = args.iri;
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

  get contentType(): string {
    return this.#contentType;
  }

  public getStateInfo(): UnrecognizedStateInfo {
    return {
      iri: this.#iri,
      contentType: this.#contentType,
    };
  }

  static fromInitialState({
    iri,
    contentType,
  }: UnrecognizedStateInfo) {
    return new UnrecognizedIntegration({ iri, contentType });
  }

}
