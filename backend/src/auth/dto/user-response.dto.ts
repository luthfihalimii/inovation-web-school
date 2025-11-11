import { UserRole } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Exclude sensitive data
  @Exclude()
  deletedAt?: Date | null;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}

export class StudentResponseDto {
  id: string;
  userId: string;
  nis: string;
  nisn: string;
  classId?: string | null;
  majorId: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: string;
  address: string;
  phone?: string | null;
  photo?: string | null;
  enrollmentYear: number;
  isActive: boolean;

  user?: UserResponseDto;

  constructor(partial: Partial<StudentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class TeacherResponseDto {
  id: string;
  userId: string;
  nip: string;
  dateOfBirth: Date;
  placeOfBirth: string;
  gender: string;
  address: string;
  phone: string;
  specialization?: string | null;
  hireDate: Date;
  photo?: string | null;
  isActive: boolean;

  user?: UserResponseDto;

  constructor(partial: Partial<TeacherResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ParentResponseDto {
  id: string;
  userId: string;
  nik: string;
  occupation?: string | null;
  phone: string;
  address: string;

  user?: UserResponseDto;

  constructor(partial: Partial<ParentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AdminResponseDto {
  id: string;
  userId: string;
  nip?: string | null;
  position?: string | null;
  phone?: string | null;

  user?: UserResponseDto;

  constructor(partial: Partial<AdminResponseDto>) {
    Object.assign(this, partial);
  }
}

export class AuthResponseDto {
  user: UserResponseDto | StudentResponseDto | TeacherResponseDto | ParentResponseDto | AdminResponseDto;
  sessionToken?: string;
  message: string;

  constructor(partial: Partial<AuthResponseDto>) {
    Object.assign(this, partial);
  }
}
