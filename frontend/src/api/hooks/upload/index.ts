import { useMutation } from '@tanstack/react-query'
import { uploadFile } from '@/api/requests'

export function useFileUpload() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
  })
}
