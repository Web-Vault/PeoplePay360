import api from './api'
export const listPayruns = async () => (await api.get('/payroll')).data
export const getPayrun = async (id) => (await api.get(`/payroll/${id}`)).data
export const getCurrentPayroll = async () => (await api.get('/payroll/current')).data
export const getEmployeePayroll = async (userId) => (await api.get(`/payroll/employee/${userId}`)).data
