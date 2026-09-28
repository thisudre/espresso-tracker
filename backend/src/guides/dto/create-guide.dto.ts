import { IsInt, IsNotEmpty, IsString, IsArray, ValidateNested, IsNumber, Min, ArrayMinSize, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class FaseDto {
  // id é gerado pelo servidor quando ausente (AC GUIDE-API-04 não exige id do cliente)
  @IsOptional() @IsString() @IsNotEmpty() id?: string;
  @IsString() @IsNotEmpty() nome!: string;
  @IsNumber() tempoObjetivo!: number;
  @IsNumber() volumeAgua!: number;
  @IsOptional() @IsString() descricao?: string;
}

export class CreateGuideDto {
  @IsString() @IsNotEmpty() method!: string;
  @IsString() @IsNotEmpty() nome!: string;
  @IsString() @IsNotEmpty() foco!: string;
  @IsString() @IsNotEmpty() moagem!: string;
  @IsInt() @Min(1) baseDose!: number;
  @IsInt() @Min(1) tempoTotalEstimado!: number;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => FaseDto)
  fases!: FaseDto[];
}
