import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getSelfSoUrl(username: string) {
  const { protocol, host } = window.location;
  return `${protocol}//${host}/${username}`;
}
