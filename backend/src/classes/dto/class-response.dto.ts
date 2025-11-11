export class ClassResponseDto {
  id: string;
  academicYearId: string;
  majorId: string;
  grade: number;
  section: string;
  name: string;
  homeroomTeacherId?: string | null;
  maxStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  academicYear?: {
    id: string;
    year: string;
    isActive: boolean;
  };

  major?: {
    id: string;
    code: string;
    name: string;
  };

  homeroomTeacher?: {
    id: string;
    nip: string;
    user: {
      name: string;
    };
  } | null;

  _count?: {
    students?: number;
    schedules?: number;
    assignments?: number;
    attendances?: number;
  };

  constructor(partial: Partial<ClassResponseDto>) {
    Object.assign(this, partial);
  }
}

export class ClassesListResponseDto {
  data: ClassResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: ClassResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
