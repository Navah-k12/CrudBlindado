import { Injectable, NotFoundException, OnModuleInit, Logger, InternalServerErrorException } from '@nestjs/common';
import { Dato } from './entities/dato.entity';
import { CreateDatoDto } from './dto/create-dato.dto';
import { UpdateDatoDto } from './dto/update-dato.dto';
import { Pool } from 'pg';

@Injectable()
export class DatosService implements OnModuleInit {
  private pool: Pool | null = null;
  private logger = new Logger(DatosService.name);

  // Fallback en memoria si la BD no está disponible
  private fallback: Dato[] = [];
  private nextId = 1;

  async onModuleInit() {
    const possibleKeys = [
      'DATABASE_URL',
      'DATABASE_URL_PUBLIC',
      'DATABASE_URL_PUBLICA',
      'URL_DE_LA_BASE_DE_DATOS',
      'URL_PÚBLICA_DE_LA_BASE_DE_DATOS',
      'DATABASE_URL_VERSEL',
      'POSTGRES_URL',
      'PGDATABASE_URL',
    ];

    const dbUrl = possibleKeys.map((k) => ({ k, v: process.env[k] })).find((x) => x.v)?.v;
    const usedKey = possibleKeys.find((k) => !!process.env[k]);
    if (!dbUrl) {
      this.logger.warn('DATABASE_URL no definida (busqué varios nombres): usando almacenamiento en memoria');
      return;
    }
    if (usedKey) this.logger.log(`Usando variable de entorno '${usedKey}' para conectar la BD`);

    try {
      this.pool = new Pool({
        connectionString: dbUrl,
        ssl: { rejectUnauthorized: false },
      });

      // Testear conexión
      await this.pool.query('SELECT 1');

      // Crear la tabla si no existe
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS datos (
          id SERIAL PRIMARY KEY,
          contenido TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW()
        );
      `);
      this.logger.log('Conectado a Postgres y tabla lista');
    } catch (err) {
      this.logger.error('No se pudo conectar a Postgres, usando fallback en memoria', err as any);
      this.pool = null;
    }
  }

  private async query(sql: string, params?: any[]) {
    if (!this.pool) throw new Error('DB_NOT_AVAILABLE');
    try {
      return await this.pool.query(sql, params);
    } catch (err) {
      this.logger.error('Error en consulta a Postgres', err as any);
      throw err;
    }
  }

  async create(createDatoDto: CreateDatoDto): Promise<Dato> {
    try {
      if (this.pool) {
        const result = await this.query(
          'INSERT INTO datos (contenido) VALUES ($1) RETURNING id, contenido',
          [createDatoDto.contenido],
        );
        return result.rows[0];
      }

      const nuevo: Dato = { id: this.nextId++, contenido: createDatoDto.contenido } as Dato;
      this.fallback.push(nuevo);
      return nuevo;
    } catch (err) {
      this.logger.error('Error creating dato', err as any);
      throw new InternalServerErrorException('Error al crear el dato');
    }
  }

  async findAll(): Promise<Dato[]> {
    try {
      if (this.pool) {
        const result = await this.query('SELECT id, contenido FROM datos ORDER BY id ASC');
        return result.rows;
      }
      return [...this.fallback];
    } catch (err) {
      this.logger.error('Error fetching datos', err as any);
      throw new InternalServerErrorException('Error al obtener los datos');
    }
  }

  async findOne(id: number): Promise<Dato> {
    try {
      if (this.pool) {
        const result = await this.query('SELECT id, contenido FROM datos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
          throw new NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return result.rows[0];
      }

      const found = this.fallback.find((d) => d.id === id);
      if (!found) throw new NotFoundException(`Dato con id ${id} no encontrado`);
      return found;
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Error fetching dato by id', err as any);
      throw new InternalServerErrorException('Error al obtener el dato');
    }
  }

  async update(id: number, updateDatoDto: UpdateDatoDto): Promise<Dato> {
    try {
      if (this.pool) {
        const result = await this.query(
          'UPDATE datos SET contenido = $1 WHERE id = $2 RETURNING id, contenido',
          [updateDatoDto.contenido, id],
        );
        if (result.rows.length === 0) {
          throw new NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return result.rows[0];
      }

      const idx = this.fallback.findIndex((d) => d.id === id);
      if (idx === -1) throw new NotFoundException(`Dato con id ${id} no encontrado`);
      this.fallback[idx].contenido = updateDatoDto.contenido;
      return this.fallback[idx];
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Error updating dato', err as any);
      throw new InternalServerErrorException('Error al actualizar el dato');
    }
  }

  async remove(id: number): Promise<{ message: string }> {
    try {
      if (this.pool) {
        const result = await this.query('DELETE FROM datos WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
          throw new NotFoundException(`Dato con id ${id} no encontrado`);
        }
        return { message: `Dato con id ${id} eliminado correctamente` };
      }

      const idx = this.fallback.findIndex((d) => d.id === id);
      if (idx === -1) throw new NotFoundException(`Dato con id ${id} no encontrado`);
      this.fallback.splice(idx, 1);
      return { message: `Dato con id ${id} eliminado correctamente` };
    } catch (err) {
      if (err instanceof NotFoundException) throw err;
      this.logger.error('Error removing dato', err as any);
      throw new InternalServerErrorException('Error al eliminar el dato');
    }
  }
}