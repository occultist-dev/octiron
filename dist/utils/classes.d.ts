type ClassArg = undefined | null | string | string[] | Record<string, boolean | undefined>;
/**
 * Merges arguments into a single css class string
 */
export declare function classes(...classArgs: ClassArg[]): string;
export {};
