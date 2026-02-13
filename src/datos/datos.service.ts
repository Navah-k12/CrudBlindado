import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Dato } from './entities/dato.entity';
import { CreateDatoDto } from './dto/create-dato.dto';
import { UpdateDatoDto } from './dto/update-dato.dto';
import { Pool } from 'pg';

@Injectable()
export class DatosService implements OnModuleInit {
  private pool: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  async create(createDatoDto: CreateDatoDto): Promise<Dato> {
    const result = await this.pool.query(
      'INSERT INTO datos (contenido) VALUES ($1) RETURNING id, contenido',
      [createDatoDto.contenido],
    );
    return result.rows[0];
  }

  async findAll(): Promise<Dato[]> {
    const result = await this.pool.query(
      'SELECT id, contenido FROM datos ORDER BY id ASC',
    );
    return result.rows;
  }

  async findOne(id: number): Promise<Dato> {
    const result = await this.pool.query(
      'SELECT id, contenido FROM datos WHERE id = $1',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Dato con id ${id} no encontrado`);
    }
    return result.rows[0];
  }

  async update(id: number, updateDatoDto: UpdateDatoDto): Promise<Dato> {
    const result = await this.pool.query(
      'UPDATE datos SET contenido = $1 WHERE id = $2 RETURNING id, contenido',
      [updateDatoDto.contenido, id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Dato con id ${id} no encontrado`);
    }
    return result.rows[0];
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.pool.query(
      'DELETE FROM datos WHERE id = $1 RETURNING id',
      [id],
    );
    if (result.rows.length === 0) {
      throw new NotFoundException(`Dato con id ${id} no encontrado`);
    }
    return { message: `Dato con id ${id} eliminado correctamente` };
  }
}
