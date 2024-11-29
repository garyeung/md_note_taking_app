import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  try {
    await app.listen(process.env.PORT || 3000);
    console.log("Server running on " + process.env.PORT || 3000)
    
  } catch (error) {
    console.error("Server fail to run", error);
    process.exit(1)
  }
}
bootstrap();
