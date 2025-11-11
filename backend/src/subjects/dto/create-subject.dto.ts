import { IsString, IsOptional, MinLength, MaxLength, IsBoolean, IsInt, Min, Max } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  @MinLength(2, { message: 'Kode mata pelajaran minimal 2 karakter' })
  @MaxLength(20, { message: 'Kode mata pelajaran maksimal 20 karakter' })
  code: string;

  @IsString()
  @MinLength(3, { message: 'Nama mata pelajaran minimal 3 karakter' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  majorId?: string;

  @IsOptional()
  @IsBoolean()
  isCore?: boolean;

  @IsOptional()
  @IsInt()
  @Min(1, { message: 'SKS minimal 1' })
  @Max(8, { message: 'SKS maksimal 8' })
  credits?: number;
}
