// Business specifics — placeholders. Fill these in before go-live (brief §7).
export const siteConfig = {
  companyName: 'Shreeji Solar',
  tagline: 'Rooftop solar across Gujarat',
  phone: '+91 90000 00000',
  whatsappNumber: '919000000000', // digits only, country code first (for wa.me)
  email: 'hello@shreejisolar.example',
  address: 'Vadodara, Gujarat, India',
  helplineToll: '15555',
  portalUrl: 'https://pmsuryaghar.gov.in',
  suryaGujaratUrl: 'https://gujaratsolar.com',
}

export const whatsappLink = (text = '') =>
  `https://wa.me/${siteConfig.whatsappNumber}` + (text ? `?text=${encodeURIComponent(text)}` : '')
