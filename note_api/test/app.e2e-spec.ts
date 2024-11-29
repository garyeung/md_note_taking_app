import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import * as request from 'supertest';
import { NoteResponse } from 'src/notes/note.interface';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const TEST_TITLE = 'test title';
  const TEST_CONTENT = 'test_CONTENT';
  let TEST_ID: number | null = null;
  
  const TEST_FILE_CONTENT = '# Test File Content';
  const TEST_FILE_NAME = 'test.md'
  let TEST_FILE_ID:number | null = null;

  const TEST_IDs = new Set<number>();

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    for(const noteID of TEST_IDs){
      try {
        await request(app.getHttpServer()) 
                    .delete("/notes/"+noteID)
                    .expect(200);
        
      } catch (error) { 
        console.error(`Failed to delete note ${noteID}:`, error);
      }
    }
    TEST_IDs.clear();
    TEST_ID = null;
    TEST_FILE_ID = null;

  })

  afterAll(async () => {
    await app.close();
  })

  describe("POST /notes", () => {
    it('should create a note successfully', async () => {
      const response = await request(app.getHttpServer())
                              .post('/notes')
                              .send({
                                title: TEST_TITLE,
                                content: TEST_CONTENT
                              })
                              .expect(201);

      expect(response.body).toEqual({
        success: true,
        data: {
          id: expect.any(Number),
          title: TEST_TITLE,
          content: TEST_CONTENT
        }
      })
      // get the id for another test
      TEST_ID = response.body.data.id;
      TEST_IDs.add(TEST_ID!);
    })
        
    it("should fail to create note without title or content", async () => {
        // intercept by the validation pipe
        await request(app.getHttpServer()).
                        post('/notes')
                        .send({
                          title: TEST_TITLE
                        })
                        .expect(400);

        await request(app.getHttpServer()).
                        post('/notes')
                        .send({
                          content: TEST_CONTENT
                        })
                        .expect(400);
      
    })

  })

  describe("GET /notes/:id", () => {

    beforeEach(async () => {
      // Create a test note if TEST_ID is null
      if (!TEST_ID) {
        const response = await request(app.getHttpServer())
          .post('/notes')
          .send({
            title: TEST_TITLE,
            content: TEST_CONTENT
          })
          .expect(201);
        TEST_ID = response.body.data.id;
        TEST_IDs.add(TEST_ID!);
      }
    });

    it('should get a note successfully', async () => {
        const response = await request(app.getHttpServer()).get('/notes/'+(TEST_ID)).expect(200);

        expect(response.body).toEqual({
          success: true,
          data: {
            id: TEST_ID,
            title: TEST_TITLE,
            content: TEST_CONTENT
          }
        })
    })

    it("should fail to get an non-exsiting note", async () => {
      await request(app.getHttpServer()).get('/notes/999').expect(404);
    })

    it("should get HTML rendered version of a note", async () => {
        const response = await request(app.getHttpServer()).get(`/notes/${TEST_ID}/html`).expect(200);

        expect(response.body).toEqual({
          success: true,
          data: expect.any(String)
        })
    })

  })

  describe("POST /notes/check-grammar", () => {
    it('should check grammar successfully', async () => {
       const response = await request(app.getHttpServer())
                              .post("/notes/check-grammar")
                              .send({
                                text: "tesing tect"
                              })
                              .expect(200);

       expect(response.body).toEqual({
        success: true,
        data: expect.any(Array)
       })
    })
  })

  describe("POST /notes/upload", () => {
    jest.setTimeout(10000);

    it("should upload a markdown file successfully", async () => {
        const response = await request(app.getHttpServer())
                        .post('/notes/upload')
                        .attach('file', Buffer.from(TEST_FILE_CONTENT),{
                          filename: TEST_FILE_NAME,
                          contentType: 'text/markdown',
                        })
                        .expect(201);

        expect(response.body).toEqual({
          success: true,
          data: {
            id: expect.any(Number),
            title: TEST_FILE_NAME,
            content: TEST_FILE_CONTENT
          }
        });

        TEST_FILE_ID = response.body.data.id;
        TEST_IDs.add(TEST_FILE_ID!);
    }, 10000);

    it("should reject non-markdown files", async () => {
       await request(app.getHttpServer())
                    .post("/notes/upload")
                    .attach('file', Buffer.from("test content"), {
                      filename: 'test.txt',
                      contentType: 'text/plain'
                    })
                    .expect(400);
    } )

    it('should reject files larger than 5MB', async () => {
      const largeContent = Buffer.alloc(6 * 1024 * 1024); // 6MB
      await request(app.getHttpServer())
        .post('/notes/upload')
        .attach('file', largeContent, {
          filename: 'large.md',
          contentType: 'text/markdown'
        })
        .expect(413);
      })
  })

  describe("GET /notes", () => {
    // for the test
    beforeEach(async () => {
      // Create multiple test notes
      const createPromises = Array(3).fill(null).map(() => 
        request(app.getHttpServer())
          .post("/notes")
          .send({
            title: TEST_TITLE,
            content: TEST_CONTENT
          })
          .expect(201)
          .then(response => {
            TEST_IDs.add(response.body.data.id);
          })
      );
      
      await Promise.all(createPromises);
    })

      it('should return mutiple notes successfully', async () => {
          const response = await request(app.getHttpServer()).get("/notes")
                          .expect(200);

          expect(response.body).toEqual({
            success: true,
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number),
                title: expect.any(String),
                content: expect.any(String)
              })
            ]) 
          })

          // Add all note IDs to TEST_NOTES for cleanup          
          response.body.data.forEach((note: NoteResponse) => {
              TEST_IDs.add(note.id);
          })
      })
  })

});
