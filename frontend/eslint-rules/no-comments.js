const DIRECTIVE =
  /^[/*\s]*(?:eslint|global|globals|exported|prettier-ignore|jsx|jsxImportSource|jsxRuntime|ts-(?:expect-error|ignore|nocheck)|vitest-environment|vite-ignore|webpack|v8 ignore|c8 ignore|istanbul|@ts-|@jsx|@vitest|@license|@preserve|@vite-ignore)/;

const isDirective = (comment) => {
  const value = comment.value.trim();
  return DIRECTIVE.test(value) || value.startsWith("/ <reference");
};

const isBlank = (text) => text.trim() === "";

function rangeToRemove(sourceCode, comment) {
  const text = sourceCode.getText();
  let [start, end] = comment.range;

  let node = sourceCode.getNodeByRangeIndex(start);
  if (node?.type === "JSXEmptyExpression") node = node.parent;
  if (node?.type === "JSXExpressionContainer" && node.expression.type === "JSXEmptyExpression") {
    [start, end] = node.range;
  }

  let lineStart = text.lastIndexOf("\n", start - 1) + 1;
  let lineEnd = text.indexOf("\n", end);
  if (lineEnd === -1) lineEnd = text.length;

  if (isBlank(text.slice(lineStart, start)) && isBlank(text.slice(end, lineEnd))) {
    return [lineStart, Math.min(lineEnd + 1, text.length)];
  }

  while (start > lineStart && (text[start - 1] === " " || text[start - 1] === "\t")) start -= 1;
  return [start, end];
}

export default {
  meta: {
    type: "suggestion",
    fixable: "whitespace",
    docs: {
      description:
        "Disallow comments in source. Code states what it does; rationale belongs in docs/ or the commit message. Tooling directives (eslint-disable, ts-expect-error, prettier-ignore, ...) stay allowed.",
    },
    schema: [],
    messages: {
      noComment:
        "Comments are not allowed. Delete it, or move the explanation to docs/ or the commit message.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          if (isDirective(comment)) continue;
          context.report({
            loc: comment.loc,
            messageId: "noComment",
            fix: (fixer) => fixer.removeRange(rangeToRemove(sourceCode, comment)),
          });
        }
      },
    };
  },
};
