import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrgRole } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';

export class AssignEnrollmentsDto {
  @ApiProperty()
  @IsString()
  courseId!: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  userIds!: string[];
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: OrgRole })
  @IsEnum(OrgRole)
  role!: OrgRole;
}

export class AssignOptionalDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
