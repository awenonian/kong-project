import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import "reflect-metadata";
import { createConnection } from "typeorm";
import { Service } from "./entity/Service";
import { Version } from "./entity/Version";

createConnection().then(async connection => {

  // We create the connection once here for use in the rest of the project.

  /**
   * I've also left commented code that was how I generated a test database.
   * Not sure if it's useful, but I figured I could leave it. It's not well
   * designed, because I only wrote it to be run once, and then be removed.
   */

  // const services = connection.getRepository(Service);
  // const versions = connection.getRepository(Version);

  // for (let i = 0; i < 20; i++) {
  //   let service = new Service();
  //   service.name = `service_${i}`
  //   service.description = `placeholder description ${i}`

  //   await services.save(service);

  //   let version1 = new Version();
  //   version1.name = `version_${i}_1`
  //   version1.description = `placeholder ${i} 1`
  //   version1.service = service;

  //   await versions.save(version1);

  //   let version2 = new Version();
  //   version2.name = `version_${i}_2`
  //   version2.description = `placeholder ${i} 2`
  //   version2.service = service;

  //   await versions.save(version2);
  // }


}).catch(error => console.log(error));

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
