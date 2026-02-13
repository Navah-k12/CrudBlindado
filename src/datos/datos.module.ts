import { Module } from '@nestjs/common';
import { DatosService } from './datos.service';
import { DatosController } from './datos.controller';

@Module({
  controllers: [DatosController],
  providers: [DatosService],
})
export class DatosModule {}
