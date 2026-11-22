import type { ReactNode } from 'react';

type Props = { tone: 'status' | 'alert'; children: ReactNode };

export function StatusMessage({ tone, children }: Props) {
  if (tone === 'alert') {
    return <p role="alert" className="alert alert-danger">{children}</p>;
  }
  return <p role="status" className="alert alert-info">{children}</p>;
}
