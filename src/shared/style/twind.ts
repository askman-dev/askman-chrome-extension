import { twind, cssom, observe } from '@twind/core';
import 'construct-style-sheets-polyfill';
import config from '@root/twind.config';
import type { Element } from 'dom-types';

export function attachTwindStyle<T extends { adoptedStyleSheets: unknown }>(
  observedElement: Element,
  documentOrShadowRoot: T,
) {
  const sheet = cssom(new window.CSSStyleSheet());
  const tw = twind(config, sheet);
  // console.info(observedElement, documentOrShadowRoot);
  observe(tw, observedElement);
  documentOrShadowRoot.adoptedStyleSheets = [sheet.target];
}
