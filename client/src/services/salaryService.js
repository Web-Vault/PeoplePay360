import api from './api'

export const listSalaryRules = async () => (await api.get('/salary/rules')).data
export const createSalaryRule = async (payload) => (await api.post('/salary/rules', payload)).data
export const updateSalaryRule = async (id, payload) => (await api.put(`/salary/rules/${id}`, payload)).data
export const deleteSalaryRule = async (id) => (await api.delete(`/salary/rules/${id}`)).data
export const listSalaryStructures = async () => (await api.get('/salary/structures')).data
export const createSalaryStructure = async (payload) => (await api.post('/salary/structures', payload)).data
export const updateSalaryStructure = async (id, payload) => (await api.put(`/salary/structures/${id}`, payload)).data
export const deleteSalaryStructure = async (id) => (await api.delete(`/salary/structures/${id}`)).data
