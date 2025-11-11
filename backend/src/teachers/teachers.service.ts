import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { QueryTeacherDto } from './dto/query-teacher.dto';
import { TeacherResponseDto, TeachersListResponseDto } from './dto/teacher-response.dto';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find all teachers with pagination and filters
   */
  async findAll(query: QueryTeacherDto): Promise<TeachersListResponseDto> {
    const { page = 1, limit = 10, search, specialization, isActive } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { nip: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { specialization: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (specialization) {
      where.specialization = { contains: specialization, mode: 'insensitive' };
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.teacher.count({ where });

    // Get paginated data
    const teachers = await this.prisma.teacher.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            homeroomClasses: true,
          },
        },
      },
      orderBy: { nip: 'asc' },
    });

    const data = teachers.map((teacher) => new TeacherResponseDto(teacher));

    return new TeachersListResponseDto(data, total, page, limit);
  }

  /**
   * Find one teacher by ID
   */
  async findOne(id: string): Promise<TeacherResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            homeroomClasses: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Guru tidak ditemukan');
    }

    return new TeacherResponseDto(teacher);
  }

  /**
   * Find teacher by user ID
   */
  async findByUserId(userId: string): Promise<TeacherResponseDto> {
    const teacher = await this.prisma.teacher.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            homeroomClasses: true,
          },
        },
      },
    });

    if (!teacher) {
      throw new NotFoundException('Data guru tidak ditemukan');
    }

    return new TeacherResponseDto(teacher);
  }

  /**
   * Update a teacher
   */
  async update(id: string, updateTeacherDto: UpdateTeacherDto): Promise<TeacherResponseDto> {
    // Check if teacher exists
    await this.findOne(id);

    // Convert dates to Date if provided
    const updateData: any = { ...updateTeacherDto };
    if (updateTeacherDto.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateTeacherDto.dateOfBirth);
    }
    if (updateTeacherDto.hireDate) {
      updateData.hireDate = new Date(updateTeacherDto.hireDate);
    }

    const teacher = await this.prisma.teacher.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            homeroomClasses: true,
          },
        },
      },
    });

    return new TeacherResponseDto(teacher);
  }

  /**
   * Delete (deactivate) a teacher
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if teacher exists
    const teacher = await this.findOne(id);

    // Deactivate instead of delete
    await this.prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });

    return {
      message: `Guru ${teacher.user?.name} berhasil dinonaktifkan`,
    };
  }
}
