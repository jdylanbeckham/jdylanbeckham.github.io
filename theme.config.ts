import { defineThemeConfig } from '@utils/defineThemeConfig'
import previewImage from '@assets/img/social-preview-image.png'
import logoImage from '@assets/img/logo.svg'

export default defineThemeConfig({
  name: 'J. Dylan Beckham',
  id: 'j-dylan-beckham',

  seo: {
    title: 'J. Dylan Beckham',
    description:
      'PMP-certified project professional combining project management, operations, business analytics, and technical fluency to turn complex objectives into structured, measurable outcomes.',
    image: previewImage,
  },

  logo: logoImage,

colors: {
  primary: '#e63946',
  secondary: '#1d3557',
  neutral: '#b9bec4',
  outline: '#e6a84a',
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
        label: 'About',
        href: '/about',
      },
      {
        type: 'link',
        label: 'Projects',
        href: '/projects',
      },
      {
        type: 'link',
        label: 'Resume',
        href: '/resume',
      },
      {
        type: 'link',
        label: 'Contact',
        href: '/contact',
      },
    ],
  },

  socials: [],
})