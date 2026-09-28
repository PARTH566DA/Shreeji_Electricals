import { useTranslation } from 'react-i18next'
import { whatsappLink, siteConfig } from '../lib/siteConfig.js'

// Floating WhatsApp + click-to-call buttons, bottom-right.
export default function WhatsAppButton() {
  const { t } = useTranslation()
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3">
      <a
        href={`tel:${siteConfig.phone.replace(/\s/g, '')}`}
        aria-label={t('contact.call')}
        className="h-12 w-12 rounded-full bg-sky-deep text-white grid place-items-center shadow-lg hover:scale-105 transition"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.5 15.5 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.3 11.3 0 0 0 3.5.56 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1 11.3 11.3 0 0 0 .56 3.5 1 1 0 0 1-.25 1z"/></svg>
      </a>
      <a
        href={whatsappLink(t('contact.whatsappPrefill'))}
        target="_blank"
        rel="noreferrer"
        aria-label={t('common.whatsapp')}
        className="h-14 w-14 rounded-full bg-leaf text-white grid place-items-center shadow-lg hover:scale-105 transition"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.4A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.7-1.2-4.4-3.9-4.5-4.1-.1-.2-1.1-1.4-1.1-2.7s.7-1.9.9-2.1c.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.8 1.9c.1.2.1.4 0 .5l-.3.5-.3.3c-.2.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.4 1.5.2.1.4.1.6-.1l.7-.8c.2-.2.4-.2.6-.1l1.8.9c.2.1.4.2.4.3.1.2.1.7-.1 1.3z"/></svg>
      </a>
    </div>
  )
}
