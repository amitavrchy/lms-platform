import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class EnrollDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  courseId!: string;
}
