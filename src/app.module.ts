import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAuthModule } from './user/userAuth/userAuth.module';
 

@Module({
  imports: [ UserAuthModule,MongooseModule.forRoot('mongodb://localhost/gng-carwash')],
  controllers: [],
  providers: [],
})
export class AppModule {}
