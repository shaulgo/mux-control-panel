import { UploadWizard } from '@/components/upload/upload-wizard';
import React from 'react';

export default function UploadPage(): React.ReactElement {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-4xl font-bold tracking-tight text-transparent">
          Upload Assets
        </h1>
        <p className="text-muted-foreground text-lg">
          Create new video assets from URLs and manage your content
        </p>
      </div>

      <UploadWizard />
    </div>
  );
}
