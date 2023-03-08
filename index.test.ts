import { expect, test } from "vitest";
import { definitionListHastToMdast } from "./index.js";

import { fromHtml as hastFromHtml } from "hast-util-from-html";
import { toMarkdown as mdastToMarkdown } from "mdast-util-to-markdown";
import { toMdast as hastToMdast } from "hast-util-to-mdast";
import { defListToMarkdown } from "mdast-util-definition-list";

import dedent from "ts-dedent";

test.each([
  {
    html: dedent`
    <dl>
    <dt>First Term</dt>
    <dd>This is the <strong>definition</strong> of the first term.</dd>
    <dd>This is another definition of the first term.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    <dd>This is another definition of the second term.</dd>
    </dl>`,
    expected: dedent`
    First Term
    :   This is the *definition* of the first term.
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    :   This is another definition of the second term.
    `,
  },
])("html => md", ({ html, expected }) => {
  const hast = hastFromHtml(html);
  const mdast = hastToMdast(hast, {
    handlers: {
      ...definitionListHastToMdast,
    },
  });
  const md = mdastToMarkdown(mdast, {
    extensions: [defListToMarkdown],
  });
  expect(md).toBe(expected);
});
