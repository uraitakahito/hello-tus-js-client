import { createIntl, createIntlCache } from "@formatjs/intl";
import type { IntlShape } from "@formatjs/intl";

export type { IntlShape };

const cache = createIntlCache();

export function setupIntl(
  locale: string,
  messages: Record<string, string>,
): IntlShape<string> {
  return createIntl({ locale, messages }, cache);
}
