import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { QuerySubjectDto } from './dto/query-subject.dto';
import { SubjectResponseDto, SubjectsListResponseDto } from './dto/subject-response.dto';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new subject
   */
  async create(createSubjectDto: CreateSubjectDto): Promise<SubjectResponseDto> {
    // Check if code already exists
    const existing = await this.prisma.subject.findUnique({
      where: { code: createSubjectDto.code },
    });

    if (existing) {
      throw new ConflictException('Kode mata pelajaran sudah digunakan');
    }

    // Check if majorId is valid (if provided)
    if (createSubjectDto.majorId) {
      const major = await this.prisma.major.findUnique({
        where: { id: createSubjectDto.majorId },
      });

      if (!major) {
        throw new NotFoundException('Jurusan tidak ditemukan');
      }
    }

    const subject = await this.prisma.subject.create({
      data: createSubjectDto,
      include: {
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            courseMaterials: true,
            quizzes: true,
          },
        },
      },
    });

    return new SubjectResponseDto(subject);
  }

  /**
   * Find all subjects with pagination and filters
   */
  async findAll(query: QuerySubjectDto): Promise<SubjectsListResponseDto> {
    const { page = 1, limit = 10, search, majorId, isCore } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (majorId) {
      where.majorId = majorId;
    }

    if (isCore !== undefined) {
      where.isCore = isCore;
    }

    // Get total count
    const total = await this.prisma.subject.count({ where });

    // Get paginated data
    const subjects = await this.prisma.subject.findMany({
      where,
      skip,
      take: limit,
      include: {
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            courseMaterials: true,
            quizzes: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = subjects.map((subject) => new SubjectResponseDto(subject));

    return new SubjectsListResponseDto(data, total, page, limit);
  }

  /**
   * Find one subject by ID
   */
  async findOne(id: string): Promise<SubjectResponseDto> {
    const subject = await this.prisma.subject.findUnique({
      where: { id },
      include: {
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            courseMaterials: true,
            quizzes: true,
          },
        },
      },
    });

    if (!subject) {
      throw new NotFoundException('Mata pelajaran tidak ditemukan');
    }

    return new SubjectResponseDto(subject);
  }

  /**
   * Update a subject
   */
  async update(id: string, updateSubjectDto: UpdateSubjectDto): Promise<SubjectResponseDto> {
    // Check if subject exists
    await this.findOne(id);

    // Check if code is being updated and already exists
    if (updateSubjectDto.code) {
      const existing = await this.prisma.subject.findFirst({
        where: {
          code: updateSubjectDto.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new ConflictException('Kode mata pelajaran sudah digunakan');
      }
    }

    // Check if majorId is valid (if being updated)
    if (updateSubjectDto.majorId) {
      const major = await this.prisma.major.findUnique({
        where: { id: updateSubjectDto.majorId },
      });

      if (!major) {
        throw new NotFoundException('Jurusan tidak ditemukan');
      }
    }

    const subject = await this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto,
      include: {
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            schedules: true,
            assignments: true,
            grades: true,
            courseMaterials: true,
            quizzes: true,
          },
        },
      },
    });

    return new SubjectResponseDto(subject);
  }

  /**
   * Delete a subject
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if subject exists
    const subject = await this.findOne(id);

    // Check if subject has related data
    const scheduleCount = await this.prisma.schedule.count({
      where: { subjectId: id },
    });

    const assignmentCount = await this.prisma.assignment.count({
      where: { subjectId: id },
    });

    const gradeCount = await this.prisma.grade.count({
      where: { subjectId: id },
    });

    if (scheduleCount > 0 || assignmentCount > 0 || gradeCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus mata pelajaran karena masih memiliki ${scheduleCount} jadwal, ${assignmentCount} tugas, dan ${gradeCount} nilai`,
      );
    }

    await this.prisma.subject.delete({
      where: { id },
    });

    return {
      message: `Mata pelajaran ${subject.name} berhasil dihapus`,
    };
  }
}
