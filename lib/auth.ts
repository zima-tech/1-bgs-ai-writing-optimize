import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { AUTH_COOKIE } from '@/lib/auth-config';

export type SessionUser = Pick<User, 'id' | 'username' | 'name' | 'department' | 'role' | 'status'>;

function getSessionUsername() {
  return cookies().get(AUTH_COOKIE)?.value?.trim() || null;
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const username = getSessionUsername();

  if (!username) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      department: true,
      role: true,
      status: true
    }
  });

  if (!user || user.status !== '启用') {
    return null;
  }

  return user;
}

export async function getLoginUser(username: string, password: string) {
  if (!username || !password) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      password: true,
      name: true,
      department: true,
      role: true,
      status: true
    }
  });

  if (!user || user.password !== password || user.status !== '启用') {
    return null;
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireCurrentUser();

  if (user.role !== '管理员') {
    redirect('/writing');
  }

  return user;
}

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json({ message: '未登录或账号已停用，请重新登录。' }, { status: 401 })
    };
  }

  return { user, response: null };
}

export async function requireApiAdminUser() {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth;
  }

  if (auth.user.role !== '管理员') {
    return {
      user: null,
      response: NextResponse.json({ message: '当前账号无权执行该操作。' }, { status: 403 })
    };
  }

  return auth;
}
