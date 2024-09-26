import { IsInt } from 'class-validator';
import { PointHistory, TransactionType, UserPoint } from './point.model';

export class PointBody {
    @IsInt()
    amount: number;
}

export class basePointRequest {
    userId: number;
    amount: number;
    type?: TransactionType;
}

export class PointDataDto {
    readonly id: number;
    readonly point: number;
    readonly updateMillis: number;

    constructor(userPoint: UserPoint) {
        this.id = userPoint.id;
        this.point = userPoint.point;
        this.updateMillis = userPoint.updateMillis;
    }
}

export class HistoryDataDto {
    readonly id: number;
    readonly userId: number;
    readonly amount: number;
    readonly type: TransactionType;
    readonly timeMillis: number;

    constructor(pointHistory: PointHistory) {
        this.id = pointHistory.id;
        this.userId = pointHistory.id;
        this.amount = pointHistory.amount;
        this.type = pointHistory.type;
        this.timeMillis = pointHistory.timeMillis;
    }
}
