import type { UserFileMeta } from '@huntflow/contracts';

export function userFileDto(file: {
  id: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: Date;
}): UserFileMeta {
  return {
    id: file.id,
    filename: file.filename,
    mimeType: file.mimeType,
    sizeBytes: file.sizeBytes,
    createdAt: file.createdAt.toISOString(),
    downloadUrl: `/api/files/${file.id}`,
  };
}
