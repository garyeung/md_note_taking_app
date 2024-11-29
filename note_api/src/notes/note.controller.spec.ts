import { GrammarService } from "../grammar/grammar.service";
import { NotesController } from "./notes.controller"
import { Test, TestingModule } from "@nestjs/testing";
import { NotesService } from "./notes.service";
import { Note } from "./note.entity";
import { HttpException, NotFoundException } from "@nestjs/common";

describe("NotesController", () => {
    let controller: NotesController;
    let notesService: NotesService;
    let grammarService: GrammarService;

    let MOCK_ID_COUNTER = 1;
    const MOCK_NOTE_DATE = new Date('2024-01-01');
    const FIRST_TITLE = 'First Note';
    const FIRST_CONTENT = "First Content";
    const SECOND_TITLE = "Second Note";
    const SECOND_CONTENT = "Second Content";
    const MOCK_NOTES:Note[] =[ 
        { id: MOCK_ID_COUNTER++, title: FIRST_TITLE, content: FIRST_CONTENT, createdAt: MOCK_NOTE_DATE },
        { id: MOCK_ID_COUNTER++, title: SECOND_TITLE, content: SECOND_CONTENT, createdAt: MOCK_NOTE_DATE }
    ]
    const MOCK_GET_ID = 5;
    const MOCK_FAILD_ID = 999;

    beforeEach(async () => {
        // Reset counter for each test
        MOCK_ID_COUNTER = 1;

        const module: TestingModule = await Test.createTestingModule({
            controllers: [NotesController],
            providers: [
            {
                provide: NotesService,

                useValue: {
                    create: jest.fn((title:string, content: string) => {
                       const note = new Note();
                       note.title = title;
                       note.content = content;
                       note.id = MOCK_ID_COUNTER++;
                       note.createdAt = MOCK_NOTE_DATE;

                       return Promise.resolve(note); 
                    }),
                    findAll: jest.fn(() => {
                        const notes: Note[] = MOCK_NOTES;

                        return Promise.resolve(notes);
                    }), 
                    findOne: jest.fn((id: number) => {
                        if(id === MOCK_FAILD_ID){
                            throw new NotFoundException("Note not found");
                        }
                        const note = new Note();
                        note.id = id;
                        note.title = `Note ${id}`;
                        note.content = `Content ${id}`;
                        note.createdAt = MOCK_NOTE_DATE;
                        return Promise.resolve(note);
                    }),
                    toHTML: jest.fn((id: number) => {
                        return Promise.resolve(`<h1>Note ${id}</h1>`);
                    }),
                    delete: jest.fn((id: number) => {
                        if(id === MOCK_FAILD_ID){
                            throw new NotFoundException("Note not found");

                        }
                        return Promise.resolve(true)
                    })
                },
            },
            {
                provide: GrammarService,
                useValue: {
                    checkGrammar: jest.fn((text: string) => {
                        return Promise.resolve([
                        {
                            "message": "Sample grammar issue.",
                            "replacements": [{}],
                            "offset": 0,
                            "length": text.length,

                        }

                        ])
                    }),
                }
            }]
        }).compile();

        controller = module.get(NotesController);
        notesService = module.get(NotesService);
        grammarService = module.get(GrammarService);

    });

    afterEach(() => {
        jest.clearAllMocks();
    })

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe("create", () =>{
        it('should create a new note with incremental ID', async () => {

            const firstNote = await controller.create({
                title: FIRST_TITLE,
                content:  FIRST_CONTENT 
            });

            expect(firstNote).toEqual({
                success: true,
                data: {
                    id: 1,
                    title: FIRST_TITLE,
                    content: FIRST_CONTENT
                } 
            });

            const secondNote = await controller.create({
            title: SECOND_TITLE,
            content: SECOND_CONTENT,
          });
    
            expect(secondNote).toEqual({
              success: true,
              data: {
                id: 2,
                title: SECOND_TITLE
                ,
                content: SECOND_CONTENT 
              }
            });
    
            expect(notesService.create).toHaveBeenCalledTimes(2);
            });
    })

    describe("list Notes", () => {
        it('should return multiple notes', async () => {

            const result = await controller.listNotes();

            expect(result).toEqual({
                success: true,
                data: [{id: 1, title: FIRST_TITLE, content: FIRST_CONTENT},
                       {id: 2, title: SECOND_TITLE, content: SECOND_CONTENT}
                ] 
            })

            expect(notesService.findAll).toHaveBeenCalled();
        })
    })

    describe('get Note', () => {
        it('should return a specific note', async () => {
            const result = await controller.getNote(MOCK_GET_ID);

            expect(result).toEqual({
                success: true,
                data: {
                    id: MOCK_GET_ID,
                    title: 'Note '+MOCK_GET_ID,
                    content: 'Content '+MOCK_GET_ID
                }
            })

            expect(notesService.findOne).toHaveBeenCalledWith(MOCK_GET_ID);
        });

        it("should handle note not found", async () =>{

            await expect(controller.getNote(MOCK_FAILD_ID)).rejects.toThrow(HttpException);
        })
    })

    describe("upload", () =>{
        it('should upload and create note from markdown file', async () =>{
            const mockFile = {
            buffer: Buffer.from('# Test Content'),
            originalname: 'test.md',
            } as Express.Multer.File;

            const result = await controller.upload(mockFile);

            expect(result).toEqual({
             success: true,
             data: {
               id: 1,
               title: 'test.md',
               content: '# Test Content'
             }
            });

           expect(notesService.create).toHaveBeenCalledWith(
            'test.md',
            '# Test Content'
           );
        })
    })    

    describe("delete Note", () => {
        it('should delete successfully', async () =>{
            const result = await controller.deleteNote(1);

            expect(result).toEqual({
                success: true,
                data: `Note 1 deleted successfully`
            })

            expect(notesService.delete).toHaveBeenCalledWith(1);
        });

        it('should delete failed', async () => {
            await expect(controller.deleteNote(MOCK_FAILD_ID)).rejects.toThrow(HttpException);
        })
    })

    describe('renderToHtml', () =>{
        it('should return HTML version of note', async () => {


            const result = await controller.renderToHtml(1);

            expect(result).toEqual({
                success: true,
                data: '<h1>Note 1</h1>' 
            })

            expect(notesService.toHTML).toHaveBeenCalledWith(1);
        })
    })

    describe("check grammar", () => {
        it('should check grammar of given text', async () => {
            const text = "Test text";
            const result = await controller.checkGrammar({text: text});

            expect(result).toEqual({
                success: true,
                data: expect.arrayContaining([
                    expect.objectContaining({
                        message: expect.any(String),
                        offset: 0,
                        replacements: expect.any(Array),
                        length: text.length 

                    })
                ])
            })

            expect(grammarService.checkGrammar).toHaveBeenCalledWith(text);


        })
    })
})