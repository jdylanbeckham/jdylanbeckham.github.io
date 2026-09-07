import { defineThemeConfig } from '@utils/defineThemeConfig'
import previewImage from '@assets/img/social-preview-image.png'
import logoImage from '@assets/img/logo.svg'

export default defineThemeConfig({
  name: 'J. Dylan Beckham',
  id: 'j-dylan-beckham',
  seo: {
    title: 'J. Dylan Beckham',
    description: 'J. Dylan Beckham is set up as an accessible portfolio with project pages and a contact flow.',
    image: previewImage,
  },
  logo: logoImage,
  colors: {
    primary: '#d648ff',
    secondary: '#00d1b7',
    neutral: '#b9bec4',
    outline: '#ff4500',
  },
  navigation: {
    darkmode: true,
    items: [
      {
              type: 'link',
              label: 'Home',
              href: '/',
            },
      {
              type: 'link',
              label: 'Portfolio',
              href: '/portfolio',
            },
      {
              type: 'link',
              label: 'Contact',
              href: '/contact',
            }
    ],
  },
  socials: [],
})
