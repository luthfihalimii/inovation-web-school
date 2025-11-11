import { IsEmail, IsString, MinLength, IsEnum, IsOptional, IsDateString, IsPhoneNumber } from 'class-validator';
import { UserRole, Gender } from '@prisma/client';

export class RegisterDto {
  @IsEmail({}, { message: 'Email tidak valid' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  password: string;

  @IsString()
  @MinLength(2, { message: 'Nama minimal 2 karakter' })
  name: string;

  @IsEnum(UserRole, { message: 'Role tidak valid' })
  role: UserRole;

  @IsOptional()
  @IsString()
  image?: string;
}

// DTO untuk registrasi Student
export class RegisterStudentDto extends RegisterDto {
  @IsString()
  nis: string;

  @IsString()
  nisn: string;

  @IsString()
  majorId: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  placeOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  classId?: string;
}

// DTO untuk registrasi Teacher
export class RegisterTeacherDto extends RegisterDto {
  @IsString()
  nip: string;

  @IsDateString()
  dateOfBirth: string;

  @IsString()
  placeOfBirth: string;

  @IsEnum(Gender)
  gender: Gender;

  @IsString()
  address: string;

  @IsString()
  phone: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsDateString()
  hireDate: string;
}

// DTO untuk registrasi Parent
export class RegisterParentDto extends RegisterDto {
  @IsString()
  nik: string;

  @IsOptional()
  @IsString()
  occupation?: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;
}

// DTO untuk registrasi Admin
export class RegisterAdminDto extends RegisterDto {
  @IsOptional()
  @IsString()
  nip?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
