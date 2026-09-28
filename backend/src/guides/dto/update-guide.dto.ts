import { IsOptional, IsInt, IsString, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { FaseDto } from './create-guide.dto.js';

export class UpdateGuideDto {
  @IsOptional() @IsString() method?: string;
  @IsOptional() @IsString() nome?: string;
  @IsOptional() @IsString() foco?: string;
  @IsOptional() @IsString() moagem?: string;
  @IsOptional() @IsInt() @Min(1) baseDose?: number;
  @IsOptional() @IsInt() @Min(1) tempoTotalEstimado?: number;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => FaseDto) fases?: FaseDto[];
}
