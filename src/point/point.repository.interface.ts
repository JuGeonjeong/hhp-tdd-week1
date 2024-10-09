import { PointHistory, TransactionType, UserPoint } from './point.model';

export interface iUserPointRepository {
    selectById(userId: number): Promise<UserPoint>;

    insert(userId: number, amount: number): Promise<UserPoint>;
}

export interface iPointHistoryRepository {
    selectAllByUserId(userId: number): Promise<PointHistory[]>;

    insert(
        userId: number,
        amount: number,
        transactionType: TransactionType,
        updateMillis: number,
    ): Promise<PointHistory>;
}
