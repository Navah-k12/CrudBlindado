import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DatosModule } from './datos/datos.module';

const isVercel = !!process.env.VERCEL;

@Module({
  imports: [
    ...(isVercel
      ? []
      : [
          ServeStaticModule.forRoot({
            rootPath: join(process.cwd(), 'public'),
            serveRoot: '/',
            exclude: ['/api/(.*)', '/datos/(.*)'],
          }),
        ]),
    DatosModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
