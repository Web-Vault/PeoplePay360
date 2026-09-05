import api from './api'

export const listEmployees = async (params = {}) => (await api.get('/employees', { params })).data
export const getEmployee = async (id) => (await api.get(`/employees/${id}`)).data
export const createEmployee = async (payload) => (await api.post('/employees', payload)).data
export const updateEmployee = async (id, payload) => (await api.put(`/employees/${id}`, payload)).data
