import api from './api'
export const getMyAttendance = async () => (await api.get('/attendance/mine')).data
export const checkIn = async () => (await api.post('/attendance/check-in')).data
export const checkOut = async () => (await api.post('/attendance/check-out')).data
export const getMyPayslips = async () => (await api.get('/payslips/mine')).data
export const getMyTimeOff = async () => (await api.get('/time-off/mine')).data
export const requestTimeOff = async (payload) => (await api.post('/time-off/mine', payload)).data
export const getDashboard = async () => (await api.get('/dashboard')).data
