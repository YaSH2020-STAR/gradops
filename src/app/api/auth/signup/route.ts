import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@prisma/client';

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['JOB_SEEKER', 'EMPLOYER', 'ADMIN']),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }
    const { email, password, role } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: role as UserRole,
      },
    });

    if (role === 'JOB_SEEKER') {
      await prisma.jobSeekerProfile.create({
        data: { userId: user.id },
      });
    } else if (role === 'EMPLOYER') {
      await prisma.employerProfile.create({
        data: { userId: user.id, companyName: 'My Company' },
      });
    }

    return NextResponse.json({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } catch (e) {
    console.error('Signup error:', e);
    return NextResponse.json({ error: 'Signup failed' }, { status: 500 });
  }
}
