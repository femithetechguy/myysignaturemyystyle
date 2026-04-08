import appConfig from '../../app.json'

export const getAppConfig = () => appConfig

export const getBusinessInfo = () => appConfig.business

/**
 * Build a Cloudinary URL from a public ID.
 * @param publicId  e.g. "myysignaturemyystyle/services/silk-press-1"
 * @param transforms  optional Cloudinary transformation string, e.g. "w_800,q_auto,f_auto"
 */
export const getCloudinaryUrl = (publicId: string, transforms = 'w_800,q_auto,f_auto') => {
  const base = appConfig.integrations.cloudinary.base_url.replace(/\/$/, '')
  return `${base}/${transforms}/${publicId}`
}

export const getStaff = () => appConfig.staff.staff_members

export const getBranding = () => appConfig.branding

export const getFeatures = () => appConfig.features

export const getContent = () => appConfig.content

export const getGallery = () => appConfig.content.gallery

export const getCareers = () => appConfig.careers
