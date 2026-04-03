import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:5173',
      'http://localhost:4173',
      'https://quiz-test-olive.vercel.app',
      'https://quiz-test-task-beta.vercel.app',
      'https://quiz-test-task-deploy-rjqf.vercel.app',
    ],
    credentials: true,
  });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
