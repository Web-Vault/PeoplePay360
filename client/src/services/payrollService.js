import api from './api'
export const listPayruns = async () => (await api.get('/payroll')).data
export const getPayrun = async (id) => (await api.get(`/payroll/${id}`)).data
