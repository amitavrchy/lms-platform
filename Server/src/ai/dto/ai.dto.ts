import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatMessageDto {
  @ApiProperty()
  @IsString()
  role!: string;

  @ApiProperty()
  @IsString()
  content!: string;
}

export class TutorDto {
  @ApiProperty()
  @IsString()
  lessonId!: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  message!: string;

  @ApiPropertyOptional({ type: [ChatMessageDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  history?: ChatMessageDto[];
}

export class QuizGenerateDto {
  @ApiProperty()
  @IsString()
  lessonId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  difficulty?: string;
}

export class IngestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  text?: string;
}
