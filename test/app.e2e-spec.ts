import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
    let app: INestApplication;

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    describe('PATCH /point/{id}/charge', () => {
        it('test', async () => {
            await request(app.getHttpServer())
                .patch('/point/1/charge')
                .send({
                    amount: 1000,
                })
                .expect(200)
                .expect((res) => {
                    if (res.body.id !== 1) {
                        throw new BadRequestException(
                            '포인트 충전은 0을 초과합니다.',
                        );
                    }
                    if (res.body.point > 10000) {
                        throw new BadRequestException(
                            '최대 잔고(10000원)를 초과했습니다.',
                        );
                    }
                });
        });
        // 음수 입력 상황 예외 처리
        it('negative amount check', async () => {
            await request(app.getHttpServer())
                .patch('/point/1/charge')
                .send({
                    amount: -1000,
                })
                .expect(400);
        });
        // 동시성 테스트 데이터 10개
        it('mutex test', async () => {
            const userId = '1';
            const amountArray = [
                1000, 3000, 2000, 1000, 200, 300, 500, 300, 200, 500,
            ];

            // 동시에 여러 포인트 충전 요청 전송
            const chargeRequests = amountArray.map((amount) =>
                request(app.getHttpServer())
                    .patch(`/point/${userId}/charge`)
                    .send({ amount })
                    .expect(200),
            );

            // 모든 요청의 완료를 기다림
            const results = await Promise.all(chargeRequests);

            // 포인트 조회
            const finalPointResult = await request(app.getHttpServer()).get(
                `/point/${userId}`,
            );

            // 총 충전된 포인트 합산
            const totalCharged = amountArray.reduce((acc, cur) => acc + cur, 0);

            // 조회 결과의 포인트가 모든 충전 요청의 합과 일치하는지 확인
            expect(finalPointResult.body.point).toBe(totalCharged);

            // History 조회
            const historyRes = await request(app.getHttpServer()).get(
                `/point/${userId}/histories`,
            );

            // History 검증 로직 추가
            expect(historyRes.body.length).toBe(amountArray.length);
        });
    });
    describe('PATCH /point/{id}/use', () => {
        it('test', async () => {
            await request(app.getHttpServer()).patch('/point/1/charge').send({
                amount: 10000,
            });
            await request(app.getHttpServer())
                .patch('/point/1/use')
                .send({
                    amount: 1000,
                })
                .expect(200);
        });
        // 음수 입력 상황 예외 처리
        it('negative amount check', async () => {
            await request(app.getHttpServer())
                .patch('/point/1/use')
                .send({
                    amount: -1000,
                })
                .expect(400);
        });
        // 동시성 테스트
        it('mutex test', async () => {
            // 포인트 충전
            await request(app.getHttpServer())
                .patch('/point/1/charge')
                .send({ amount: 10000 })
                .expect(200);

            // 동시에 여러 번 포인트 사용 요청
            const useRequests = Array.from({ length: 10 }, (_, i) =>
                request(app.getHttpServer())
                    .patch('/point/1/use')
                    .send({ amount: 500 })
                    .expect(200),
            );

            // 모든 요청의 완료를 기다림
            await Promise.all(useRequests);

            // 최종 포인트 잔액 확인
            const finalResult = await request(app.getHttpServer()).get(
                '/point/1',
            );
            // 예상 잔액 확인
            expect(finalResult.body.point).toBe(5000);
        });
    });
});
