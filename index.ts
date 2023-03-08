import type { Handle } from "hast-util-to-mdast";

const dl: Handle = (state, element, parent) => {
  return;
};

const dt: Handle = (state, element, parent) => {
  return;
};

const dd: Handle = (state, element, parent) => {
  return;
};

const definitionListHastToMdast = {
  dl,
  dt,
  dd,
};

export { definitionListHastToMdast };
