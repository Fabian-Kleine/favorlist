import { getRequestConfig } from "next-intl/server"
import { cookies, headers } from "next/headers"

const locales = ["en", "de"] as const
type Locale = (typeof locales)[number]

async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value
  if (cookieLocale && (locales as readonly string[]).includes(cookieLocale)) {
    return cookieLocale as Locale
  }

  const headerStore = await headers()
  const acceptLanguage = headerStore.get("accept-language") ?? ""
  for (const part of acceptLanguage.split(",")) {
    const lang = part.split(";")[0].trim().slice(0, 2).toLowerCase()
    if ((locales as readonly string[]).includes(lang)) {
      return lang as Locale
    }
  }

  return "en"
}

export default getRequestConfig(async () => {
  const locale = await detectLocale()
  const messages =
    locale === "de"
      ? (await import("./messages/de.json")).default
      : (await import("./messages/en.json")).default

  return { locale, messages }
})
