import { IsInt } from 'class-validator';
import { PointHistory, TransactionType, UserPoint } from './point.model';

export class PointBody {
    @IsInt()
    amount: number;
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

// export class PointHistoryDto {
//     id: number;
//     userId: number;
//     type: TransactionType;
//     amount: number;
//     timeMillis: number;

//     constructor(pointHistory: PointHistory) {
//         this.id = pointHistory.id;
//         this.userId = pointHistory.userId;
//         this.type = pointHistory.type;
//         this.amount = pointHistory.amount;
//         this.timeMillis = pointHistory.timeMillis;
//     }
// }
