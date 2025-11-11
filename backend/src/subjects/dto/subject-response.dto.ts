export class SubjectResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  majorId?: string | null;
  isCore: boolean;
  credits: number;
  createdAt: Date;
  updatedAt: Date;

  major?: {
    id: string;
    code: string;
    name: string;
  } | null;

  _count?: {
    schedules?: number;
    assignments?: number;
    grades?: number;
    courseMaterials?: number;
    quizzes?: number;
  };

  constructor(partial: Partial<SubjectResponseDto>) {
    Object.assign(this, partial);
  }
}

export class SubjectsListResponseDto {
  data: SubjectResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: SubjectResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
