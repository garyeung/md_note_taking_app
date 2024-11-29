import { Test, TestingModule } from "@nestjs/testing";
import { GrammarService } from "./grammar.service"
import { ConfigModule } from "@nestjs/config";
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("GrammarService", () => {
    let service: GrammarService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [ConfigModule.forRoot()],
            providers: [GrammarService]
        }).compile();

        service = module.get(GrammarService);
        jest.clearAllMocks();

    })

   it("should be defined", () => {
       expect(service).toBeDefined();
   });

   describe("checkGrammar", () => {
        it("should successfully check grammar", async () => {
            const mockMatches = [
            {
              "message": "This sentence does not start with an uppercase letter.",
              "replacements": [
                {
                  "value": "Helo"
                }
              ],
              "offset": 0,
              "length": 4,
            }
            ]; 

           mockedAxios.post.mockResolvedValueOnce({
            data: {matches: mockMatches}
           }) 

            const result = await service.checkGrammar('helo world');
            
            expect(result[0]).toEqual(expect.objectContaining({
                message: expect.any(String),
                offset: expect.any(Number),
                replacements: expect.any(Array),
                length: expect.any(Number)
            }));

            expect(mockedAxios.post).toHaveBeenCalledWith(
                process.env.GRAMMAR_API,
                expect.any(URLSearchParams),
                expect.objectContaining({
                    headers:{
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json',
                    }
                })
            );
        }, 10000);

        it("should throw error when API request fails", async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error("Request failed"));


            await expect(service.checkGrammar("test text"))
                .rejects
                .toThrow("Request failed");
        })

        it("should throw error when network fails", async () => {
            mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

            await expect(service.checkGrammar("test text"))
                .rejects
                .toThrow("Network error");
        })
   })
})