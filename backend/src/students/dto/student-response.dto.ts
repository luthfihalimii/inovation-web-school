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
  graduationYear?: number | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };

  class?: {
    id: string;
    name: string;
    grade: number;
  } | null;

  major?: {
    id: string;
    code: string;
    name: string;
  };

  parent?: {
    id: string;
    nik: string;
    user: {
      name: string;
      email: string;
    };
  } | null;

  constructor(partial: Partial<StudentResponseDto>) {
    Object.assign(this, partial);
  }
}

export class StudentsListResponseDto {
  data: StudentResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: StudentResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
