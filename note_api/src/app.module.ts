import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotesModule } from './notes/notes.module';
import { Note } from './notes/note.entity';
import { GrammarModule } from './grammar/grammar.module';

@Module({
  imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
            type: 'postgres',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT!),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            entities: [Note],
            synchronize: process.env.NODE_ENV !== 'production',

        }),
        NotesModule,
        GrammarModule
      ],

  controllers: [],
  providers: [],
})
export class AppModule {};
