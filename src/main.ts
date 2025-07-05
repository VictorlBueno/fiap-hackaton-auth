import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/modules/app.modules';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: true,
    credentials: true,
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Auth service running on port ${port}`);
}

bootstrap(); 