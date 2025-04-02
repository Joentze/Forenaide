import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/upload/')({
  component: UploadFiles,
})

function UploadFiles() {
  return <>
    <h1> Upload files </h1>
    <Button>Upload</Button>
  </>
}
