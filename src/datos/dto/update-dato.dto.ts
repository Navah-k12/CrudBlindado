import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateDatoDto {
  @IsNotEmpty({ message: 'El contenido no puede estar vacio' })
  @IsString({ message: 'El contenido debe ser texto' })
  contenido: string;
}
