import { api } from '@/api/instance'

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('storage/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}
