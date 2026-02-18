import type { Children } from 'mithril';
import type { Failure, HTTPErrorView, ContentParsingView } from './types/store.ts';


export class UndefinedFailure implements Failure {
  undefined(children: Children): Children {
    return children;
  }

  http(children: Children): Children;
  http(view: HTTPErrorView): Children;
  http(): Children {
    return null;
  }

  unparserable(children: Children): Children;
  unparserable(view: ContentParsingView): Children;
  unparserable(): Children {
    return null;
  }
}

export class HTTPFailure implements Failure {
  #status: number;
  #res: Response;

  constructor(status: number, res: Response) {
    this.#status = status;
    this.#res = res;
  }

  get status(): number {
    return this.#status;
  }

  get res(): Response {
    return this.#res;
  }

  undefined(): Children {
    return null;
  }

  http(children: Children): Children;
  http(view: HTTPErrorView): Children;
  http(arg: Children | HTTPErrorView): Children {
    if (typeof arg === 'function') {
      return arg(this.#status);
    }

    return arg;
  }

  unparserable(children: Children): Children;
  unparserable(view: ContentParsingView): Children;
  unparserable(): Children {
    return null;
  }
}

export class ContentHandlingFailure implements Failure {
  #error: Error;

  constructor(error: Error) {
    this.#error = error;
  }

  get error(): Error {
    return this.#error;
  }

  undefined(): Children {
    return null;
  }

  http(children: Children): Children;
  http(view: HTTPErrorView): Children;
  http(): Children {
    return null;
  }

  unparserable(children: Children): Children;
  unparserable(view: ContentParsingView): Children;
  unparserable(arg: Children | ContentParsingView): Children {
    if (typeof arg === 'function') {
      return arg(this.#error);
    }

    return arg;
  }
}
