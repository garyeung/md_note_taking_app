import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Note } from './note.entity';
import { GrammarModule } from '../grammar/grammar.module';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Note]),
        GrammarModule,
    ],
    controllers: [NotesController],
    providers: [NotesService],
})
export class NotesModule {}
