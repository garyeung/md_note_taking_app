import { Body, Controller, Delete, Get, HttpCode, HttpException, HttpStatus, Param, ParseIntPipe, Post, UploadedFile, UseFilters, UseInterceptors, UsePipes } from "@nestjs/common";
import { NotesService } from "./notes.service";
import { GrammarService } from "../grammar/grammar.service";
import { ApiResponse, NoteResponse } from "./note.interface";
import { ZodValidationPipe } from "../pipes/validation.pipe";
import { CreateNoteDto, createNoteSchema } from "./note.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { GrammarCheckDto, grammarCheckSchema } from "../grammar/grammar.dto";
import { HttpExceptionFilter } from "../filters/exception.filter";
import * as path from 'path';

@UseFilters(HttpExceptionFilter)
@Controller('notes')
export class NotesController{
    constructor(
        private readonly notesService: NotesService,
        private readonly grammarService: GrammarService
    ){}

    // POST /notes -- save a new note
    @Post()
    @UsePipes(new ZodValidationPipe(createNoteSchema))
    async create(@Body() noteDto:CreateNoteDto):Promise<ApiResponse<NoteResponse>>{


            const createdNote = await this.notesService.create(noteDto.title, noteDto.content) 

            return {
                success: true,
                data: {
                    id: createdNote.id,
                    content: createdNote.content,
                    title: createdNote.title
                }
            };
    }

    // POST /notes/upload -- upload a markdown file 
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        limits:{
            fileSize: 1024*1024*5  // 5MB
        },
        fileFilter:(req, file,callback) => {
            if (!file) {
             callback(new HttpException('File is required', HttpStatus.BAD_REQUEST), false);
             return;
            }

            if(path.extname(file.originalname).toLowerCase() !== '.md'){
                callback(new HttpException("Only .md files are allowed", HttpStatus.BAD_REQUEST),false);
                return;
            }
            callback(null, true);
        }
    }))
    async  upload(@UploadedFile() file: Express.Multer.File):Promise<ApiResponse<NoteResponse>>{

            const fileContent = file.buffer.toString('utf-8');
            const title = file.originalname;
            const note = await this.notesService.create(title,fileContent);

            return {
                success: true,
                data: {
                    id: note.id,
                    title: note.title,
                    content: note.content
                }
            };

            
    }

    // POST /notes/check-grammar -- check grammar for given text
    @Post('check-grammar')
    @UsePipes(new ZodValidationPipe(grammarCheckSchema))    
    @HttpCode(200)
    async checkGrammar(@Body() body: GrammarCheckDto): Promise<ApiResponse<any>>{
        const data =  await this.grammarService.checkGrammar(body.text);
        return {
            success: true,
            data
        }
    }


    // GET /notes -- list all notes 
    @Get()
    async listNotes():Promise<ApiResponse<NoteResponse[]>> {
        
        const notes = await this.notesService.findAll();

        return {
            success: true,
            data:  notes.map((note) => {
                const noteResponse: NoteResponse = {
                    id: note.id,
                    content: note.content,
                    title: note.title
                }
                return noteResponse;
            })
        }

    }

    // GET /notes/:id -- get a specific note

    @Get(':id')
    async getNote(@Param('id', ParseIntPipe)id: number):Promise<ApiResponse<NoteResponse>> {

        const note = await this.notesService.findOne(id);

        return {
            success: true,
            data: {
                id: note.id,
                title: note.title,
                content: note.content
            }
        } 
    }

    // GET /notes/:id/html  -get HTML rendered version of a note
    @Get(':id/html')
    async renderToHtml(@Param('id', ParseIntPipe) id: number):Promise<ApiResponse<string>> {
        const html = await this.notesService.toHTML(id);

        return{
            success: true,
            data: html
        }
    }

    @Delete(':id')
    @HttpCode(200)
    async deleteNote(@Param('id', ParseIntPipe) id: number):Promise<ApiResponse<string>> {
        try {
           await this.notesService.delete(id); 
           return {
             success: true,
             data: `Note ${id} deleted successfully`
           }
            
        }
        catch (error) {
           throw new HttpException(`Fail to delete Note ${id}`, HttpStatus.NOT_FOUND); 
        }

    }
}