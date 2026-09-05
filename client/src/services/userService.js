import api from './api'

export async function listUsers(params = {}) {
  const { data } = await api.get('/users', { params })
  return data
}

export async function getUser(id) {
  const { data } = await api.get(`/users/${id}`)
  return data
}

export async function createUser(payload) {
  const { data } = await api.post('/users', payload)
  return data
}

export async function updateUser(id, payload) {
  const { data } = await api.put(`/users/${id}`, payload)
  return data
}

export async function deleteUser(id) {
  const { data } = await api.delete(`/users/${id}`)
  return data
}

export async function resetUserPassword(id, newPassword) {
  const { data } = await api.put(`/users/${id}/reset-password`, { newPassword })
  return data
}

export async function updateMyProfile(payload) {
  const { data } = await api.put('/users/me/profile', payload)
  return data
}

export async function changeMyPassword(currentPassword, newPassword) {
  const { data } = await api.put('/users/me/change-password', {
    currentPassword,
    newPassword
  })
  return data
}
