const re = /^( +)[^ $]/m;

export function dedent(content: string): string;
export function dedent(content: TemplateStringsArray): string;
export function dedent(tabSize: number, content: string): string;

/**
 * Naive logic which strips whitespace based of the first detected indent level.
 * There is no tab support, only spaces are handled. Also be careful
 * when using this function. Once it has detected a tab it is not careful about
 * removing non-whitespace characters that are within the first tab width.
 */
export function dedent(arg1: string | TemplateStringsArray | number, arg2?: string): string {
  let tabSize: number;
  let content: string;

  if (typeof arg1 === 'number') {
    tabSize = arg1;
    content = arg2 as string;
  } else if (typeof arg1 === 'string') {
    re.lastIndex = 0;
    const res = re.exec(arg1);
    
    tabSize = res?.[1]?.length ?? 0;
    content = arg1;
  } else {
    return dedent(arg1[0]);
  }

  if (tabSize === 0) {
    return content;
  }

  if (content[0] === '\n') {
    content = content.slice(1);
  }

  return content.split('\n')
    .map((line) => line.slice(tabSize))
    .join('\n');
}

