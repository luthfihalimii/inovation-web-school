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
  createdAt: Date;
  updatedAt: Date;

  user?: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  };

  _count?: {
    schedules?: number;
    assignments?: number;
    grades?: number;
    homeroomClasses?: number;
  };

  constructor(partial: Partial<TeacherResponseDto>) {
    Object.assign(this, partial);
  }
}

export class TeachersListResponseDto {
  data: TeacherResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: TeacherResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
