import { Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';

@Injectable()
export abstract class UserPointRepository {
    abstract selectById(userId: number): Promise<UserPoint>;

    abstract insertOrUpdate(userId: number, amount: number): Promise<UserPoint>;
}

@Injectable()
export abstract class PointHistoryRepository {
    abstract selectAllByUserId(userId: number): Promise<PointHistory[]>;

    abstract insert(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
    ): Promise<PointHistory>;
}
