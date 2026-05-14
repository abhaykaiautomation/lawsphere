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
    if (e.message === 'Unauthorized') return unauthorized();
    if (e.message.includes('not found') || e.message.includes('Not found')) return notFound(e.message);
    if (e.message.includes('Forbidden') || e.message.includes('Access denied')) return forbidden();
    if (e.message.includes('already')) return conflict(e.message);
  }
  console.error(e);
  return err('Internal server error', 500);
}
