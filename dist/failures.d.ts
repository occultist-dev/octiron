import type { Children } from 'mithril';
import type { Failure, HTTPErrorView, ContentParsingView } from './types/store.js';
export declare class UndefinedFailure implements Failure {
    undefined(children: Children): Children;
    http(children: Children): Children;
    http(view: HTTPErrorView): Children;
    unparserable(children: Children): Children;
    unparserable(view: ContentParsingView): Children;
}
export declare class HTTPFailure implements Failure {
    #private;
    constructor(status: number, res: Response);
    get status(): number;
    get res(): Response;
    undefined(): Children;
    http(children: Children): Children;
    http(view: HTTPErrorView): Children;
    unparserable(children: Children): Children;
    unparserable(view: ContentParsingView): Children;
}
export declare class ContentHandlingFailure implements Failure {
    #private;
    constructor(error: Error);
    get error(): Error;
    undefined(): Children;
    http(children: Children): Children;
    http(view: HTTPErrorView): Children;
    unparserable(children: Children): Children;
    unparserable(view: ContentParsingView): Children;
}
