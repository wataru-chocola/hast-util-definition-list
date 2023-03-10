import { expect, test } from "vitest";
import { defListHastToMdast } from "./index.js";

import { fromHtml as hastFromHtml } from "hast-util-from-html";
import { toMarkdown as mdastToMarkdown } from "mdast-util-to-markdown";
import { toMdast as hastToMdast } from "hast-util-to-mdast";
import { defListToMarkdown } from "mdast-util-definition-list";

import { dedent } from "ts-dedent";

test.each([
  {
    title: "simple tight dl",
    html: `
    <p>This is paragraph.</p>
    <dl>
    <dt>First Term</dt>
    <dd>This is the <strong>definition</strong> of the first term.</dd>
    <dd>This is another definition of the first term.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    <dd>This is another definition of the second term.</dd>
    </dl>`,
    expected: `
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
    title: "not preserve break-line in dd",
    html: `
    <dl>
    <dt>First Term</dt>
    <dd>This is the <strong>definition</strong> of the first term.
    Break lines in definition are not preserved.</dd>
    <dt>Second Term</dt>
    <dd>This is one definition of the second term.</dd>
    </dl>`,
    expected: `
    First Term
    :   This is the **definition** of the first term. Break lines in definition are not preserved.

    Second Term
    :   This is one definition of the second term.
    `,
  },
  {
    title: "associate multiple terms to a definition",
    html: `
    <dl>
    <dt>Term 1</dt>
    <dt>Term 2</dt>
    <dd>Definition a</dd>
    <dt>Term 3</dt>
    <dd>Definition b</dd>
    </dl>`,
    expected: `
    Term 1
    Term 2
    :   Definition a

    Term 3
    :   Definition b
    `,
  },
  {
    title: "definition term can be decorated",
    html: `
    <dl>
    <dt>A<strong>pp</strong>le</dt>
    <dd>Pomaceous fruit of plants of the genus Malus in
    the family Rosaceae.</dd>
    <dt>Orange</dt>
    <dd>The fruit of an evergreen tree of the genus Citrus.</dd>
    </dl>`,
    expected: `
    A**pp**le
    :   Pomaceous fruit of plants of the genus Malus in the family Rosaceae.

    Orange
    :   The fruit of an evergreen tree of the genus Citrus.
    `,
  },
  {
    title: "item list inside tight dd",
    html: `
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
    expected: `
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
    html: `
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
    expected: `
    First Term

    :   This is a loose definition.

        *   item1
        *   item2
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    `,
  },
  {
    title: "contains a loose (spread) definition",
    html: `
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
    expected: `
    First Term

    :   This is a loose definition.

        *   item1
        *   item2
    :   This is another definition of the first term.

    Second Term
    :   This is one definition of the second term.
    `,
  },
  {
    title: "wrapped in div",
    html: `
    <dl>
      <div>
        <dt>First Item</dt>
        <dd>First Description</dd>
      </div>
      <div>
        <dt>Second Item</dt>
        <dd>Second Description</dd>
      </div>
      <div>
        <dt>Third Item</dt>
        <dd>Third Description</dd>
      </div>
    </dl>
    `,
    expected: `
    First Item
    :   First Description

    Second Item
    :   Second Description

    Third Item
    :   Third Description
    `,
  },
  {
    title: "nested defList",
    html: `
    <dl>
    <dt>Term 1</dt>
    <dd>
    <p>This is a definition wrapped by paragraph.</p>
    <dl>
    <dt>Nested term 1</dt>
    <dd>Nested description here.
    And next line.</dd>
    <dt>Nested term 2</dt>
    <dd>Description 2.</dd>
    </dl></dd>
    <dd>
    <p>Description.</p>
    </dd>
    <dt>Term 2</dt>
    <dd>
    <p>Description.</p></dd>
    </dl>`,
    expected: `
    Term 1

    :   This is a definition wrapped by paragraph.

        Nested term 1
        :   Nested description here. And next line.

        Nested term 2
        :   Description 2.

    :   Description.

    Term 2

    :   Description.
    `,
  },

  {
    title: "code block inside dd",
    html: `
    <dl>
    <dt>Term</dt>
    <dd>
    <pre><code>import sys
    sys.stdout.write("hello")
    </code></pre></dd>
    </dl>`,
    expected: `
    Term
    :       import sys
            sys.stdout.write("hello")
    `,
  },
  {
    title:
      "defList can contain multiple paragraph and other block-level elements",
    html: `
    <dl>
    <dt>Term 1</dt>
    <dd>
    <p>This is a definition with two paragraphs. Lorem ipsum
    dolor sit amet, consectetuer adipiscing elit. Aliquam
    hendrerit mi posuere lectus.</p>
    <p>Vestibulum enim wisi, viverra nec, fringilla in, laoreet
    vitae, risus.</p>
    </dd>
    <dd>
    <p>Second definition for term 1, also wrapped in a paragraph
    because of the blank line preceding it.</p>
    </dd>
    <dt>Term 2</dt>
    <dd>
    <p>This definition has a code block, a blockquote and a list.</p>
    <pre><code>code block.
    </code></pre>
    <blockquote>
    <p>block quote
    on two lines.</p>
    </blockquote>
    <ol>
    <li>first list item</li>
    <li>second list item</li>
    </ol></dd>
    </dl>`,
    expected: `
    Term 1

    :   This is a definition with two paragraphs. Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aliquam hendrerit mi posuere lectus.

        Vestibulum enim wisi, viverra nec, fringilla in, laoreet vitae, risus.

    :   Second definition for term 1, also wrapped in a paragraph because of the blank line preceding it.

    Term 2

    :   This definition has a code block, a blockquote and a list.

            code block.

        > block quote on two lines.

        1.  first list item
        2.  second list item
    `,
  },
  {
    title: `unsafe character`,
    html: `
    <p>Not Term</p>
    <p>:   Not Definition</p>
    `,
    expected: `
    Not Term

    \\: Not Definition
    `,
  },
])("html => md: $title", ({ html, expected }) => {
  const hast = hastFromHtml(dedent(html), { fragment: true });
  const mdast = hastToMdast(hast, {
    handlers: {
      ...defListHastToMdast,
    },
  });
  const md = mdastToMarkdown(mdast, {
    extensions: [defListToMarkdown],
  });
  expect(md).toBe(dedent(expected) + "\n");
});
