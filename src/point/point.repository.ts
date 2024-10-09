import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { UserPointTable } from 'src/database/userpoint.table';
import {
    iPointHistoryRepository,
    iUserPointRepository,
} from './point.repository.interface';
import { PointHistoryTable } from 'src/database/pointhistory.table';

// @Injectable()
// export abstract class UserPointRepository {
//     /**
//      * @interface UserPointRepository.selectById()
//      * @method selectById
//      */
//     abstract selectById(userId: number): Promise<UserPoint>;
//     abstract insert(userId: number, amount: number): Promise<UserPoint>;
// }

// @Injectable()
// export abstract class PointHistoryRepository {
//     abstract selectAllByUserId(userId: number): Promise<PointHistory[]>;
//     abstract insert(
//         userId: number,
//         amount: number,
//         transactionType: TransactionType,
//         updateMillis: number,
//     ): Promise<PointHistory>;
// }

@Injectable()
export class UserPointRepository implements iUserPointRepository {
    constructor(private readonly userPointDb: UserPointTable) {}

    async selectById(userId: number): Promise<UserPoint> {
        return await this.userPointDb.selectById(userId);
    }

    async insert(userId: number, amount: number): Promise<UserPoint> {
        return await this.userPointDb.insertOrUpdate(userId, amount);
    }
}

@Injectable()
export class PointHistoryRepository implements iPointHistoryRepository {
    constructor(private readonly historyDb: PointHistoryTable) {}

    async selectAllByUserId(userId: number): Promise<PointHistory[]> {
        return await this.historyDb.selectAllByUserId(userId);
    }

    async insert(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
    ): Promise<PointHistory> {
        return await this.historyDb.insert(
            userId,
            amount,
            transactionType,
            updateMillis,
        );
    }
}
