import { getPublicApiBaseUrl } from "@/lib/api-base";
import { getAccessToken } from "@/lib/auth-token";

export async function fetchAuthenticatedFileBlobUrl(
  fileId: string,
  inline = false,
): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  const q = inline ? "?inline=1" : "";
  const res = await fetch(`${getPublicApiBaseUrl()}/api/files/${encodeURIComponent(fileId)}${q}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

export async function fetchAttachmentBlobUrl(
  attachmentId: string,
  inline = false,
): Promise<string | null> {
  const token = getAccessToken();
  if (!token) return null;

  const q = inline ? "?inline=1" : "";
  const res = await fetch(
    `${getPublicApiBaseUrl()}/api/attachments/${encodeURIComponent(attachmentId)}${q}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  if (!res.ok) return null;
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
