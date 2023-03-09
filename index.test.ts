import { expect, test } from "vitest";
import { definitionListHastToMdast, dl } from "./index.js";

import { fromHtml as hastFromHtml } from "hast-util-from-html";
import { toMarkdown as mdastToMarkdown } from "mdast-util-to-markdown";
import { toMdast as hastToMdast } from "hast-util-to-mdast";
import { defListToMarkdown } from "mdast-util-definition-list";

import dedent from "ts-dedent";

test.each([
  {
    title: "simple tight dl",
    html: dedent`
    <p>This is paragraph.</p>
    <dl>
    <dt>First Term</dt>
    <dd>This is the <strong>definition</strong> of the first term.</dd>
    <dd>This is another definition of the first term.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    <dd>This is another definition of the second term.</dd>
    </dl>`,
    expected: dedent`
    This is paragraph.

    First Term
    :   This is the **definition** of the first term.
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    :   This is another definition of the second term.
    `,
  },
  {
    title: "item list inside tight dd",
    html: dedent`
    <dl>
    <dt>First Term</dt>
    <dd>This is the <strong>definition</strong> of the first term.
    <ul>
    <li>item1</li>
    <li>item2</li>
    </ul>
    </dd>
    <dd>This is another definition of the first term.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    </dl>`,
    expected: dedent`
    First Term
    :   This is the **definition** of the first term.
        *   item1
        *   item2
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    `,
  },
  {
    title: "contains a loose (spread) definition",
    html: dedent`
    <dl>
    <dt>First Term</dt>
    <dd>
    <p>This is a loose definition.</p>
    <ul>
    <li>item1</li>
    <li>item2</li>
    </ul>
    </dd>
    <dd>This is another definition of the first term.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    </dl>`,
    expected: dedent`
    First Term

    :   This is a loose definition.

        *   item1
        *   item2
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    `,
  },
])("html => md: $title", ({ html, expected }) => {
  const hast = hastFromHtml(html, { fragment: true });
  const mdast = hastToMdast(hast, {
    handlers: {
      ...definitionListHastToMdast,
    },
  });
  const md = mdastToMarkdown(mdast, {
    extensions: [defListToMarkdown],
  });
  expect(md).toBe(expected + "\n");
});
