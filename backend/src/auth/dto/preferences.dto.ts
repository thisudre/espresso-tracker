import { IsOptional, IsString } from 'class-validator';

export class PreferencesDto {
  // @IsOptional() ignora null/undefined — permite limpar a preferência
  @IsOptional()
  @IsString()
  preferredRecipeId!: string | null;
}
