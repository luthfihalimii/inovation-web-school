import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateClassDto {
  @IsString()
  academicYearId: string;

  @IsString()
  majorId: string;

  @IsInt()
  @Min(10, { message: 'Grade minimal 10' })
  @Max(12, { message: 'Grade maksimal 12' })
  grade: number;

  @IsString()
  section: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  homeroomTeacherId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxStudents?: number;
}
