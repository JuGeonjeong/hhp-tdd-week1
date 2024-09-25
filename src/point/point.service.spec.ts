import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import exp from 'constants';
import { TransactionType } from './point.model';

describe('PointService', () => {
    let service: PointService;
    let userDb: UserPointTable;
    let historyDb: PointHistoryTable;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PointService, UserPointTable, PointHistoryTable],
        }).compile();

        service = module.get<PointService>(PointService);
        userDb = module.get<UserPointTable>(UserPointTable);
        historyDb = module.get<PointHistoryTable>(PointHistoryTable);
    });

    it('default', () => {
        expect(service).toBeDefined();
    });

    // 사용내역 추가
    describe('addPointHistory', () => {
        it('history check', async () => {
            const userId = 1;
            const amount = 2000;
            const transactionType = TransactionType.CHARGE;
            const updateMillis = Date.now();

            const newData = await service.addPointHistory(
                userId,
                amount,
                transactionType,
                updateMillis,
            );
            const userPoingHistory = await service.findAll(1);

            expect(userPoingHistory[0]).toBe(newData);
        });
    });

    // 유저 포인트 업데이트
    describe('insertOrUpdate', () => {
        it('update point check', async () => {
            const id = 1;
            const amount = 2000;

            const data = await userDb.insertOrUpdate(id, amount);
            const afterData = await userDb.selectById(id);
            expect(data).toBe(afterData);
        });
    });

    // 아이디별 포인트 조회 테스트
    describe('findOne()', () => {
        it('userPoint check', async () => {
            // 특정 유저 포인트 충전
            await service.chargeOrUpdate({ userId: 1, amount: 2000 });
            const userPoint = await service.findOne(1);
            expect(userPoint).toMatchObject({
                id: 1,
                point: 2000,
            });
        });
    });

    // 포인트 충전
    describe('chargeOrUpdate', () => {
        // amount: 0 이하 체크
        it('negative amount check', async () => {
            await expect(
                service.chargeOrUpdate({
                    userId: 1,
                    amount: -2000,
                }),
            ).rejects.toThrow('포인트 충전은 0을 초과합니다.');
        });
        // 최대 잔고 체크
        it('maximum point check', async () => {
            await expect(
                service.chargeOrUpdate({
                    userId: 1,
                    amount: 10001,
                }),
            ).rejects.toThrow('최대 잔고(10000원)를 초과했습니다.');
        });
    });

    // 포인트 사용
    describe('useOrUpdate', () => {
        // 0 이나 음수 포인트 사용 테스트
        it('negative amount check', async () => {
            await expect(
                service.useOrUpdate({
                    userId: 1,
                    amount: 0,
                }),
            ).rejects.toThrow('사용 포인트를 확인해주세요.');
            await expect(
                service.useOrUpdate({
                    userId: 1,
                    amount: -1,
                }),
            ).rejects.toThrow('사용 포인트를 확인해주세요.');
        });

        // 잔고가 부족할 경우 테스트
        it('point empty check', async () => {
            await service.chargeOrUpdate({
                userId: 1,
                amount: 2000,
            });
            await expect(
                service.useOrUpdate({
                    userId: 1,
                    amount: 2001,
                }),
            ).rejects.toThrow('보유 포인트를 초과했습니다.');
        });
    });
});
