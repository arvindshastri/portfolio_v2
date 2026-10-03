import { CircleCheck, LockOpen } from 'lucide-react';
import { useRef } from 'react';
import type { Toast as ToastData } from '../store';

const ICON = { copied: CircleCheck, unlocked: LockOpen };

/** A short message with an icon. It keeps showing its last message while it fades out. */
export function Toast({ toast, className }: { toast: ToastData | null; className: string }) {
  const last = useRef<ToastData | null>(null);
  if (toast) last.current = toast;
  const shown = last.current;
  const Icon = shown ? ICON[shown.icon] : null;
  return (
    <div className={`toast ${className}${toast ? ' on' : ''}`} role="status">
      {Icon && <Icon aria-hidden="true" strokeWidth={2.25} />}
      {shown?.text}
    </div>
  );
}
