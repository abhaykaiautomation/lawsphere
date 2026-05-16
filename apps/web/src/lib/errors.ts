import { NextResponse } from 'next/server';

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function err(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}

export const unauthorized = () => err('Unauthorized', 401);
export const forbidden = () => err('Forbidden', 403);
export const notFound = (msg = 'Not found') => err(msg, 404);
export const conflict = (msg: string) => err(msg, 409);

export function handleError(e: unknown) {
  if (e instanceof Error) {
    // Prisma unique constraint violation (P2002)
    const prismaCode = (e as Record<string, unknown>).code as string | undefined;
    if (prismaCode === 'P2002') {
      const target = ((e as Record<string, unknown>).meta as Record<string, string[]> | undefined)?.target?.[0] ?? '';
      if (target === 'barCouncilNumber') return conflict('This Bar Council enrollment number is already registered.');
      if (target === 'email')            return conflict('An account with this email already exists.');
      if (target === 'slug')             return conflict('Profile slug already taken.');
      return conflict('A record with this value already exists.');
    }
    if (e.message === 'Unauthorized') return unauthorized();
    if (e.message.includes('not found') || e.message.includes('Not found')) return notFound(e.message);
    if (e.message.includes('Forbidden') || e.message.includes('Access denied')) return forbidden();
    if (e.message.includes('already')) return conflict(e.message);
  }
  console.error(e);
  return err('Internal server error', 500);
}
