import { BadRequestException, Injectable } from '@nestjs/common';
// import { PointHistoryTable } from 'src/database/pointhistory.table';

import { PointHistory, TransactionType, UserPoint } from './point.model';
import { PointDataDto, PointBody } from './point.dto';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';

@Injectable()
export class PointService {
    constructor(
        private readonly historyDb: PointHistoryTable,
        private readonly userDb: UserPointTable,
    ) {}

    // 특정 유저 포인트 조회
    async findOne(id: number): Promise<UserPoint> {
        if (id === null)
            throw new BadRequestException('유저 아이디가 없습니다.');
        const data = await this.userDb.selectById(id);
        return new PointDataDto(data);
    }

    // 특정 유저 포인트 히스토리 리스트 조회
    async findAll(userId: number): Promise<PointHistory[]> {
        if (userId === null)
            throw new BadRequestException('유저 아이디가 없습니다.');
        return await this.historyDb.selectAllByUserId(userId);
    }

    // 포인트 기록(history) 추가 함수
    async addPointHistory(
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

    // 포인트 충전
    async chargeOrUpdate({
        userId,
        amount,
    }: {
        userId: number;
        amount: number;
    }) {
        // 0 이하 체크
        if (amount < 1) {
            throw new BadRequestException('포인트 충전은 0을 초과합니다.');
        }
        // 최대 잔고 체크
        const exUserPoint = await this.findOne(userId);
        if (exUserPoint.point + amount > 10000) {
            throw new BadRequestException('최대 잔고(10000원)를 초과했습니다.');
        }

        // 유저 포인트 업데이트
        const updatedUserPoint = await this.userDb.insertOrUpdate(
            userId,
            amount,
        );

        // 포인트 기록 추가
        await this.addPointHistory(
            userId,
            amount,
            TransactionType.CHARGE,
            updatedUserPoint.updateMillis,
        );

        return new PointDataDto(updatedUserPoint);
    }

    // 포인트 사용
    async useOrUpdate({ userId, amount }: { userId: number; amount: number }) {
        // 0 이나 음수 포인트 사용 테스트
        if (amount < 1)
            throw new BadRequestException('사용 포인트를 확인해주세요.');

        // 잔고가 부족할 경우 테스트
        const exUserPoint = await this.findOne(userId);
        if (exUserPoint.point < amount)
            throw new BadRequestException(
                `보유 포인트를 초과했습니다. 보유포인트: ${exUserPoint.point}`,
            );

        // 포인트 차감
        const calcPoint = exUserPoint.point - amount;
        const updatedUserPoint = await this.userDb.insertOrUpdate(
            userId,
            calcPoint,
        );

        // 포인트 기록 추가
        await this.addPointHistory(
            userId,
            amount,
            TransactionType.USE,
            updatedUserPoint.updateMillis,
        );

        return new PointDataDto(updatedUserPoint);
    }
}
