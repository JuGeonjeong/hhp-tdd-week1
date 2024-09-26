import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { PointService } from './point.service';
import { BadRequestException } from '@nestjs/common';

describe('PointController', () => {
    let controller: PointController;
    let service: PointService;
    let userId = '1';

    beforeEach(async () => {
        const app: TestingModule = await Test.createTestingModule({
            controllers: [PointController],
            providers: [
                {
                    provide: PointService,
                    useValue: {
                        chargeOrUpdate: jest.fn(),
                        useOrUpdate: jest.fn(),
                        findOne: jest.fn(),
                        findAll: jest.fn(),
                        lockTable: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = app.get<PointController>(PointController);
        service = app.get<PointService>(PointService);
    });

    it('controller.point()', async () => {
        await controller.point(userId);

        // 호출 횟수 테스트
        expect(service.findOne).toHaveBeenCalledTimes(1);
        // 호출 인자 타입 테스트
        expect(service.findOne).toHaveBeenCalledWith(parseInt(userId));
    });
    it('controller.findAll()', async () => {
        await controller.history(userId);

        expect(service.findAll).toHaveBeenCalledTimes(1);
        expect(service.findAll).toHaveBeenCalledWith(parseInt(userId));
    });
    it('controller.charge()', async () => {
        const amount = 5000;
        await controller.charge(userId, { amount });

        expect(service.chargeOrUpdate).toHaveBeenCalledTimes(1);
        expect(service.chargeOrUpdate).toHaveBeenCalledWith({
            userId: parseInt(userId),
            amount,
        });
    });
    it('controller.use()', async () => {
        const amount = 3000;
        await controller.use(userId, { amount });

        expect(service.useOrUpdate).toHaveBeenCalledTimes(1);
        expect(service.useOrUpdate).toHaveBeenCalledWith({
            userId: parseInt(userId),
            amount,
        });
    });
});
