import { BadRequestException, Injectable } from '@nestjs/common';
import { PointHistory, TransactionType, UserPoint } from './point.model';
import { HistoryDataDto, PointDataDto, basePointRequest } from './point.dto';
import {
    UserPointRepository,
    PointHistoryRepository,
} from './point.repository';

@Injectable()
export class PointService {
    constructor(
        private readonly userPpointRepo: UserPointRepository,
        private readonly pointHistoryRepo: PointHistoryRepository,
    ) {}

    // 특정 유저 포인트 조회
    async findOne(id: number): Promise<UserPoint> {
        return await this.userPpointRepo.selectById(id);
    }

    // 특정 유저 포인트 히스토리 리스트 조회
    async findAll(userId: number): Promise<PointHistory[]> {
        const list = await this.pointHistoryRepo.selectAllByUserId(userId);
        return list.map((v) => new HistoryDataDto(v));
    }

    // 유저 포인트 업데이트, 기록 추가
    async updatePoint({ userId, amount, type }: basePointRequest) {
        // 포인트 업데이트
        let updatedUserPoint;
        const exUser = await this.findOne(userId);
        const calcPoint = type === TransactionType.CHARGE ? amount : -amount;

        if (userId) {
            updatedUserPoint = await this.userPpointRepo.insertOrUpdate(
                userId,
                exUser.point + calcPoint,
            );
        } else {
            updatedUserPoint = await this.userPpointRepo.insertOrUpdate(
                userId,
                calcPoint,
            );
        }

        // 포인트 기록 추가
        await this.pointHistoryRepo.insert(
            userId,
            amount,
            type,
            updatedUserPoint.updateMillis,
        );

        return new PointDataDto(updatedUserPoint);
    }

    // 포인트 충전
    async chargeOrUpdate({ userId, amount }: basePointRequest) {
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
        const values = {
            userId,
            amount,
            type: TransactionType.CHARGE,
        };
        const updatedUserPoint = await this.updatePoint(values);

        return updatedUserPoint;
    }

    // 포인트 사용
    async useOrUpdate({ userId, amount }: basePointRequest) {
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
        const values = {
            userId,
            amount,
            type: TransactionType.USE,
        };
        const updatedUserPoint = await this.updatePoint(values);

        return updatedUserPoint;
    }
}
