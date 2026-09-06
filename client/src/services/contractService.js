import api from './api'
export const listContracts = async () => (await api.get('/contracts')).data
export const getContract = async (id) => (await api.get(`/contracts/${id}`)).data
export const updateContract = async (id, payload) => (await api.put(`/contracts/${id}`, payload)).data
export const renewContract = async (id, payload) => (await api.post(`/contracts/${id}/renew`, payload)).data
