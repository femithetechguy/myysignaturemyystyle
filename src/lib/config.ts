import appConfig from '../../app.json'

export const getAppConfig = () => appConfig

export const getBusinessInfo = () => appConfig.business

export const getServices = () => appConfig.services.default_services

export const getStaff = () => appConfig.staff.staff_members

export const getBranding = () => appConfig.branding

export const getFeatures = () => appConfig.features

export const getContent = () => appConfig.content

export const getGallery = () => appConfig.content.gallery

export const getCareers = () => appConfig.careers
