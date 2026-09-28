// Business specifics — placeholders. Fill these in before go-live (brief §7).
export const siteConfig = {
  companyName: 'Shreeji Electricals',
  tagline: 'Rooftop solar across Gujarat',
  phone: '+91 8141445599',
  whatsappNumber: '918141445599', // digits only, country code first (for wa.me)
  email: 'hello@shreejisolar.example',
  address: 'Vadodara, Gujarat, India',
  helplineToll: '15555',
  portalUrl: 'https://pmsuryaghar.gov.in',
  suryaGujaratUrl: 'https://gujaratsolar.com',
}

export const whatsappLink = (text = '') =>
  `https://wa.me/${siteConfig.whatsappNumber}` + (text ? `?text=${encodeURIComponent(text)}` : '')
