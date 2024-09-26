import { Test, TestingModule } from '@nestjs/testing';
import { PointService } from './point.service';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { TransactionType } from './point.model';
import {
    PointHistoryRepository,
    UserPointRepository,
} from './point.repository';

describe('PointService', () => {
    let service: PointService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PointService,
                {
                    provide: PointHistoryRepository,
                    useClass: PointHistoryTable,
                },
                {
                    provide: UserPointRepository,
                    useClass: UserPointTable,
                },
            ],
        }).compile();

        service = module.get<PointService>(PointService);
    });

    it('default', () => {
        expect(service).toBeDefined();
    });

    // 유저 포인트 업데이트
    describe('insertOrUpdate()', () => {
        it('update point check', async () => {
            const userId = 1;
            const amount = 2000;

            const data = await service.chargeOrUpdate({ userId, amount });
            const afterData = await service.findOne(userId);

            expect(data).toMatchObject(afterData);
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

    // 아이디별 포인트 조회 테스트
    describe('findAll()', () => {
        it('histories check', async () => {
            // 특정 유저 포인트 충전
            const userId = 1;
            await service.chargeOrUpdate({ userId, amount: 3000 });
            await service.chargeOrUpdate({ userId, amount: 4000 });
            await service.useOrUpdate({ userId, amount: 2000 });
            await service.useOrUpdate({ userId, amount: 1000 });

            const histories = await service.findAll(1);
            expect(histories[0].type).toBe(TransactionType.CHARGE);
            expect(histories[1].type).toBe(TransactionType.CHARGE);
            expect(histories[2].type).toBe(TransactionType.USE);
            expect(histories[3].type).toBe(TransactionType.USE);
        });
    });

    // 포인트 충전
    describe('chargeOrUpdate()', () => {
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

        it('success', async () => {
            // 임의 number[]
            const arrayNum = Array.from(
                { length: 5 },
                (_, index) => Math.floor(Math.random() * 10) + 1,
            );
            // 기본값에서 차감 값 반환
            const accumulates = arrayNum.reduce<number[]>(
                (a, b) => [...a, a.at(-1) + b],
                [0],
            );
            // 일치 테스트
            for (let i = 0; i < arrayNum.length; i++) {
                const amount = arrayNum[i];
                const pointAfterCharge = await service.chargeOrUpdate({
                    userId: 1,
                    amount,
                });

                expect(pointAfterCharge.point).toBe(accumulates[i + 1]);
            }
        });
    });

    // 포인트 사용
    describe('useOrUpdate()', () => {
        // 0 이나 음수 포인트 사용 테스트
        it('negative amount check', async () => {
            await expect(
                service.useOrUpdate({
                    userId: 1,
                    amount: 0,
                }),
            ).rejects.toThrow('포인트 사용은 0을 초과합니다.');
            await expect(
                service.useOrUpdate({
                    userId: 1,
                    amount: -1,
                }),
            ).rejects.toThrow('포인트 사용은 0을 초과합니다.');
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

        // 성공
        it('success', async () => {
            await service.chargeOrUpdate({
                userId: 1,
                amount: 10000,
            });
            // 임의 number[]
            const arrayNum = Array.from(
                { length: 5 },
                (_, index) => Math.floor(Math.random() * 10) + 1,
            );
            // 기본값에서 차감 값 반환
            const accumulates = arrayNum.reduce<number[]>(
                (a, b) => [...a, a.at(-1) - b],
                [10000],
            );
            // 일치 테스트
            for (let i = 0; i < arrayNum.length; i++) {
                const amount = arrayNum[i];
                const pointAfterCharge = await service.useOrUpdate({
                    userId: 1,
                    amount,
                });

                expect(pointAfterCharge.point).toBe(accumulates[i + 1]);
            }
        });
    });
});
