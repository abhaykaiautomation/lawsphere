'use client';

import { useAuthStore } from '@/stores/auth.store';
import { MessagesUI } from '@/components/common/messages-ui';

export default function LawyerMessagesPage() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!user) return null;
  return (
    <MessagesUI
      token={token!}
      userId={user.id}
      title="Messages"
      subtitle="Chat with your clients — one conversation per appointment"
    />
  );
}
