import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassDto } from './dto/query-class.dto';
import { ClassResponseDto, ClassesListResponseDto } from './dto/class-response.dto';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new class
   */
  async create(createClassDto: CreateClassDto): Promise<ClassResponseDto> {
    // Check if academic year exists
    const academicYear = await this.prisma.academicYear.findUnique({
      where: { id: createClassDto.academicYearId },
    });

    if (!academicYear) {
      throw new NotFoundException('Tahun ajaran tidak ditemukan');
    }

    // Check if major exists
    const major = await this.prisma.major.findUnique({
      where: { id: createClassDto.majorId },
    });

    if (!major) {
      throw new NotFoundException('Jurusan tidak ditemukan');
    }

    // Check if homeroom teacher exists (if provided)
    if (createClassDto.homeroomTeacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: createClassDto.homeroomTeacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Wali kelas tidak ditemukan');
      }
    }

    // Check for duplicate class (same academic year, major, grade, section)
    const existing = await this.prisma.class.findFirst({
      where: {
        academicYearId: createClassDto.academicYearId,
        majorId: createClassDto.majorId,
        grade: createClassDto.grade,
        section: createClassDto.section,
      },
    });

    if (existing) {
      throw new ConflictException('Kelas sudah ada untuk tahun ajaran ini');
    }

    const classData = await this.prisma.class.create({
      data: createClassDto,
      include: {
        academicYear: {
          select: {
            id: true,
            year: true,
            isActive: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            nip: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
            assignments: true,
            attendances: true,
          },
        },
      },
    });

    return new ClassResponseDto(classData);
  }

  /**
   * Find all classes with pagination and filters
   */
  async findAll(query: QueryClassDto): Promise<ClassesListResponseDto> {
    const { page = 1, limit = 10, search, academicYearId, majorId, grade, isActive } = query;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { section: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (academicYearId) {
      where.academicYearId = academicYearId;
    }

    if (majorId) {
      where.majorId = majorId;
    }

    if (grade !== undefined) {
      where.grade = grade;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Get total count
    const total = await this.prisma.class.count({ where });

    // Get paginated data
    const classes = await this.prisma.class.findMany({
      where,
      skip,
      take: limit,
      include: {
        academicYear: {
          select: {
            id: true,
            year: true,
            isActive: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            nip: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
            assignments: true,
            attendances: true,
          },
        },
      },
      orderBy: [{ grade: 'asc' }, { section: 'asc' }],
    });

    const data = classes.map((classData) => new ClassResponseDto(classData));

    return new ClassesListResponseDto(data, total, page, limit);
  }

  /**
   * Find one class by ID
   */
  async findOne(id: string): Promise<ClassResponseDto> {
    const classData = await this.prisma.class.findUnique({
      where: { id },
      include: {
        academicYear: {
          select: {
            id: true,
            year: true,
            isActive: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            nip: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
            assignments: true,
            attendances: true,
          },
        },
      },
    });

    if (!classData) {
      throw new NotFoundException('Kelas tidak ditemukan');
    }

    return new ClassResponseDto(classData);
  }

  /**
   * Update a class
   */
  async update(id: string, updateClassDto: UpdateClassDto): Promise<ClassResponseDto> {
    // Check if class exists
    await this.findOne(id);

    // Validate references if being updated
    if (updateClassDto.academicYearId) {
      const academicYear = await this.prisma.academicYear.findUnique({
        where: { id: updateClassDto.academicYearId },
      });

      if (!academicYear) {
        throw new NotFoundException('Tahun ajaran tidak ditemukan');
      }
    }

    if (updateClassDto.majorId) {
      const major = await this.prisma.major.findUnique({
        where: { id: updateClassDto.majorId },
      });

      if (!major) {
        throw new NotFoundException('Jurusan tidak ditemukan');
      }
    }

    if (updateClassDto.homeroomTeacherId) {
      const teacher = await this.prisma.teacher.findUnique({
        where: { id: updateClassDto.homeroomTeacherId },
      });

      if (!teacher) {
        throw new NotFoundException('Wali kelas tidak ditemukan');
      }
    }

    const classData = await this.prisma.class.update({
      where: { id },
      data: updateClassDto,
      include: {
        academicYear: {
          select: {
            id: true,
            year: true,
            isActive: true,
          },
        },
        major: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        homeroomTeacher: {
          select: {
            id: true,
            nip: true,
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            students: true,
            schedules: true,
            assignments: true,
            attendances: true,
          },
        },
      },
    });

    return new ClassResponseDto(classData);
  }

  /**
   * Delete a class
   */
  async remove(id: string): Promise<{ message: string }> {
    // Check if class exists
    const classData = await this.findOne(id);

    // Check if class has students
    const studentCount = await this.prisma.student.count({
      where: { classId: id },
    });

    if (studentCount > 0) {
      throw new BadRequestException(
        `Tidak dapat menghapus kelas karena masih memiliki ${studentCount} siswa`,
      );
    }

    await this.prisma.class.delete({
      where: { id },
    });

    return {
      message: `Kelas ${classData.name} berhasil dihapus`,
    };
  }

  /**
   * Get students in a class
   */
  async getStudents(id: string) {
    // Check if class exists
    await this.findOne(id);

    const students = await this.prisma.student.findMany({
      where: { classId: id, isActive: true },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        major: {
          select: {
            code: true,
            name: true,
          },
        },
      },
      orderBy: { nis: 'asc' },
    });

    return students;
  }
}
