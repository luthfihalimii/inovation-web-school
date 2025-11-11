export class MajorResponseDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  image?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    students?: number;
    classes?: number;
    subjects?: number;
  };

  constructor(partial: Partial<MajorResponseDto>) {
    Object.assign(this, partial);
  }
}

export class MajorsListResponseDto {
  data: MajorResponseDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };

  constructor(data: MajorResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.meta = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
