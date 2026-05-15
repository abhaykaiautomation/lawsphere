// /lawyer/pending is outside the lawyer portal guard —
// pending lawyers must be able to reach it before approval.
// Individual page handles its own auth check via useAuthStore.
export default function PendingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
