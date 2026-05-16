'use client';

import { useAuthStore } from '@/stores/auth.store';
import { SignInPrompt } from '@/components/layouts/sign-in-prompt';
import { MessagesUI } from '@/components/common/messages-ui';

export default function ClientMessagesPage() {
  const user  = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  if (!user) return <SignInPrompt message="Sign in to view your messages" />;
  return (
    <MessagesUI
      token={token!}
      userId={user.id}
      title="Messages"
      subtitle="Chat with your lawyers — one conversation per appointment"
    />
  );
}
