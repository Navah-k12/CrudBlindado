import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { DatosService } from './datos.service';
import { CreateDatoDto } from './dto/create-dato.dto';
import { UpdateDatoDto } from './dto/update-dato.dto';

@Controller('datos')
export class DatosController {
  constructor(private readonly datosService: DatosService) {}

  @Post()
  async create(@Body() createDatoDto: CreateDatoDto) {
    return this.datosService.create(createDatoDto);
  }

  @Get()
  async findAll() {
    return this.datosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.datosService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateDatoDto: UpdateDatoDto) {
    return this.datosService.update(id, updateDatoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.datosService.remove(id);
  }
}
