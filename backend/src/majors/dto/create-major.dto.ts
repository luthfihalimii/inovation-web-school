import { IsString, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';

export class CreateMajorDto {
  @IsString()
  @MinLength(2, { message: 'Kode jurusan minimal 2 karakter' })
  @MaxLength(10, { message: 'Kode jurusan maksimal 10 karakter' })
  code: string;

  @IsString()
  @MinLength(3, { message: 'Nama jurusan minimal 3 karakter' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
