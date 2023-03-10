import type { Handle } from "hast-util-to-mdast";
import { Element, ElementContent } from "hast";
import { PhrasingContent } from "mdast";
import {
  DefList,
  DefListTerm,
  DefListDescription,
} from "mdast-util-definition-list";
import type {
  DefListNode,
  DefListDescriptionNode,
  DefListTermNode,
} from "mdast-util-definition-list";
import { phrasing } from "mdast-util-phrasing";

/**
 * dl element handler
 *
 * @public
 */
export const dl: Handle = (state, element, _parent) => {
  // unwrap div
  // see: https://github.com/syntax-tree/hast-util-to-mdast/blob/main/lib/handlers/dl.js
  const children = element.children.reduce((acc, child) => {
    if (child.type === "element" && child.tagName === "div") {
      return acc.concat(child.children);
    }
    return acc.concat([child]);
  }, [] as ElementContent[]);

  const mdastChildren = children
    .map((child) => state.one(child, element))
    .flat()
    .filter(
      (node): node is DefListTermNode | DefListDescriptionNode =>
        node != null &&
        (node.type === "defListTerm" || node.type === "defListDescription")
    );
  const result = {
    type: DefList,
    children: mdastChildren,
  } satisfies DefListNode;
  state.patch(element, result);
  return result;
};

/**
 * dt element handler
 *
 * @public
 */
export const dt: Handle = (state, element) => {
  const children = state
    .all(element)
    .filter((node): node is PhrasingContent => phrasing(node));
  const result = { type: DefListTerm, children } satisfies DefListTermNode;
  state.patch(element, result);
  return result;
};

/**
 * dd element handler
 *
 * @public
 */
export const dd: Handle = (state, element, parent) => {
  const children = state.toFlow(state.all(element));
  const spread = spreadout(element);
  const result = {
    type: DefListDescription,
    spread,
    children,
  } satisfies DefListDescriptionNode;
  state.patch(element, result);
  return result;
};

function spreadout(element: Element) {
  for (const child of element.children) {
    if (child.type !== "element") continue;

    if (phrasing(child)) continue;
    if (child.tagName === "p" || spreadout(child)) {
      return true;
    }
  }
  return false;
}

const defListHastToMdast = {
  dl,
  dt,
  dd,
};

export { defListHastToMdast };
