import api from './api'
export const getToday = async () => (await api.get('/attendance/me/today')).data
export const checkIn = async () => (await api.post('/attendance/me/check-in')).data
export const checkOut = async () => (await api.post('/attendance/me/check-out')).data
export const chooseOvertime = async (date, choice) => (await api.post('/attendance/me/overtime-choice', { date, choice })).data
