import { Module } from '@nestjs/common';
import { PointController } from './point.controller';
import { DatabaseModule } from '../database/database.module';
import { PointService } from './point.service';
import {
    PointHistoryRepository,
    UserPointRepository,
} from './point.repository';

@Module({
    imports: [DatabaseModule],
    controllers: [PointController],
    providers: [
        PointService,
        {
            provide: 'userPointRepo',
            useClass: UserPointRepository,
        },
        {
            provide: 'pointHistoryRepo',
            useClass: PointHistoryRepository,
        },
    ],
})
export class PointModule {}
