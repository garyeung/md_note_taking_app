import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from 'typeorm';
import { Note } from "./note.entity";
import { marked } from "marked";

@Injectable()
export class NotesService {
      constructor(
            @InjectRepository(Note)
            private notesRespo: Repository<Note>
      ){}
      
      async create(title: string, content: string){
            if (!title || !content) {
                throw new Error('Title and content are required');
            }

            const note = new Note();
            note.title = title;
            note.content = content;

            return this.notesRespo.save(note);
      }

      async findAll(){
            return this.notesRespo.find();
      }

      async findOne(id: number) {
            const note = await this.notesRespo.findOne({
                  where: {
                        id: id
                  }
            });

            if(!note){
                  throw new NotFoundException("Note not found");
            }

            return note
      }

      async toHTML(id: number){
            const note = await this.findOne(id);

            return marked(note.content);
      }

      async delete(id: number){
            const result = await this.notesRespo.delete({id})
            if(result.affected === 0){
                  throw new NotFoundException("Note not found");
            }
            return true;
      }
}