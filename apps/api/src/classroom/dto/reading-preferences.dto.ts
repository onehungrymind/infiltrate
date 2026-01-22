import { IsString, IsOptional, IsIn } from 'class-validator';
import { ReadingTheme, FontSize, LineSpacing, FontFamily } from '../entities/reading-preferences.entity';

export class UpdateReadingPreferencesDto {
  @IsString()
  @IsIn(['light', 'dark', 'sepia'])
  @IsOptional()
  theme?: ReadingTheme;

  @IsString()
  @IsIn(['small', 'medium', 'large'])
  @IsOptional()
  fontSize?: FontSize;

  @IsString()
  @IsIn(['compact', 'normal', 'relaxed'])
  @IsOptional()
  lineSpacing?: LineSpacing;

  @IsString()
  @IsIn(['sans', 'serif', 'mono'])
  @IsOptional()
  fontFamily?: FontFamily;
}

export class ReadingPreferencesResponseDto {
  id: string;
  userId: string;
  theme: ReadingTheme;
  fontSize: FontSize;
  lineSpacing: LineSpacing;
  fontFamily: FontFamily;
}
