import { supabase } from '@/lib/supabase';

const AVATARS_BUCKET = 'avatars';
const RECEIPTS_BUCKET = 'receipts';

export async function uploadImage(
  bucket: string,
  path: string,
  file: Blob,
  contentType = 'image/jpeg',
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true, contentType });

  if (error) throw error;
  return data.path;
}

export async function getSignedUrl(
  bucket: string,
  path: string,
  expiresIn = 3600,
): Promise<string | null> {
  const { data } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);

  return data?.signedUrl ?? null;
}

export function getPublicUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadAvatar(userId: string, file: Blob): Promise<string> {
  const path = `${userId}/avatar.jpg`;
  return uploadImage(AVATARS_BUCKET, path, file);
}

export function avatarPublicUrl(path: string): string {
  return getPublicUrl(AVATARS_BUCKET, path);
}

export async function uploadReceipt(expenseId: string, file: Blob): Promise<string> {
  const path = `${expenseId}/receipt-${Date.now()}.jpg`;
  return uploadImage(RECEIPTS_BUCKET, path, file);
}

export async function receiptSignedUrl(path: string): Promise<string | null> {
  return getSignedUrl(RECEIPTS_BUCKET, path);
}
