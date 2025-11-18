import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import fr from './locales/fr/common.json'

i18next.use(initReactI18next).init({
  lng: 'fr',
  fallbackLng: 'fr',
  resources: { fr: { translation: fr } },
})

export default i18next

