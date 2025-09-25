import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { VideosModule } from './modules/videos/videos.module';
import { CollectionsModule } from './modules/collections/collections.module';
import { BookmarksModule } from './modules/bookmarks/bookmarks.module';
import { FeedModule } from './modules/feed/feed.module';
import { UploadModule } from './modules/upload/upload.module';
import { SearchModule } from './modules/search/search.module';
import { JwtModule } from '@nestjs/jwt';
import { AppConfig } from './app.config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { FollowingAccountsModule } from './modules/following-accounts/following-accounts.module';
import { ExtractColorsModule } from './modules/extract-colors/extract-colors.module';
import { GoogleShoppingModule } from './modules/google-shopping/google-shopping.module';
import { AiModule } from './modules/ai/ai.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthMiddleware } from './middlewares/auth/auth.middleware';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: AppConfig().JWT_SECRET,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [AppConfig],
    }),
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        dialect: 'postgres',
        host: configService.get('DB_HOST') || 'localhost',
        port: parseInt(configService.get('DB_PORT') || '5432', 10),
        username: configService.get('DB_USER') || 'postgres',
        password: configService.get('DB_PASS') || '0000',
        database: configService.get('DB_NAME') || 'outfitted',
        autoLoadModels: true,
        synchronize: true,
        logging: false,
      }),
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 20,
    }]),
    AuthModule,
    UserModule,
    VideosModule,
    CollectionsModule,
    BookmarksModule,
    FeedModule,
    UploadModule,
    SearchModule,
    FollowingAccountsModule,
    ExtractColorsModule,
    GoogleShoppingModule,
    AiModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {provide: APP_GUARD, useClass: ThrottlerGuard},
    {provide: APP_GUARD, useClass: AuthMiddleware},
  ],
})
export class AppModule {}
