import { UploadWizard } from '@/components/upload/upload-wizard';

export default function UploadPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Upload Assets
        </h1>
        <p className="text-lg text-muted-foreground">
          Create new video assets from URLs and manage your content
        </p>
      </div>

      <UploadWizard />
    </div>
  );
}
