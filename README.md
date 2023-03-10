# hast-util-definition-list

[![Node.js CI](https://github.com/wataru-chocola/hast-util-definition-list/actions/workflows/node.js.yml/badge.svg)](https://github.com/wataru-chocola/hast-util-definition-list/actions/workflows/node.js.yml)

hast-util-to-mdast handlers for definition list

## Feature

This package provides [hast-util-to-mdast] handlers converting `dl`, `dt`, `dd` hast nodes into mdast elements compatible with [mdast-util-definition-list].

[hast-util-to-mdast]: https://github.com/syntax-tree/hast-util-to-mdast
[mdast-util-definition-list]: https://github.com/wataru-chocola/mdast-util-definition-list

## Install

From npm:

```console
$ npm install hast-util-definition-list
```

## API

Export [hast-util-to-mdast]'s handler (`Handle`) and handlers (`Record<string, Handle>`).

 * `defListHastToMdast` (type: `Record<"dl"|"dt"|"dd", Handle>`)
 * `dl` (type: `Handle`)
 * `dt` (type: `Handle`)
 * `dd` (type: `Handle`)

## Use

```typescript
import { defListHastToMdast } from "hast-util-definition-list";

import { fromHtml as hastFromHtml } from "hast-util-from-html";
import { toMarkdown as mdastToMarkdown } from "mdast-util-to-markdown";
import { toMdast as hastToMdast } from "hast-util-to-mdast";
import { defListToMarkdown } from "mdast-util-definition-list";

const html = `
<p>This is paragraph.</p>
<dl>
<dt>First Term</dt>
<dd>This is the <strong>definition</strong> of the first term.</dd>
<dd>This is another definition of the first term.</dd>
<dt>Second Term</dt>
<dd>This is one definition of the second term.</dd>
<dd>This is another definition of the second term.</dd>
</dl>`;

const hast = hastFromHtml(html, { fragment: true });
const mdast = hastToMdast(hast, {
  handlers: {
    ...defListHastToMdast,
  },
});
const md = mdastToMarkdown(mdast, {
  extensions: [defListToMarkdown],
});
 
console.log(md);
// output =>
//
//  This is paragraph.
//
//  First Term
//  :   This is the **definition** of the first term.
//  :   This is another definition of the first term.
//
//  Second Term
//  :   This is one definition of the second term.
//  :   This is another definition of the second term.
```
 