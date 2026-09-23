import { Router, Response, NextFunction } from "express";
import auth, { AuthRequest } from "../../infrastructure/middlewares/auth";
import { requireOwner, requireAdmin } from "../../infrastructure/middlewares/authorize";
import CreateDepositUseCase from "../../app/usecases/deposits/create-deposit.usecase";
import GetDepositsUseCase from "../../app/usecases/deposits/get-deposits.usecase";
import DeleteDepositUseCase from "../../app/usecases/deposits/delete-deposit.usecase";
import UpdateDepositUseCase from "../../app/usecases/deposits/update-deposit.usecase";

export interface DepositDependencies {
    createDepositUseCase: CreateDepositUseCase;
    getDepositsUseCase: GetDepositsUseCase;
    deleteDepositUseCase: DeleteDepositUseCase;
    updateDepositUseCase: UpdateDepositUseCase;
}

export function DepositRouter(deps: DepositDependencies): Router {
    const router = Router();
    router.use(auth);

    router.post("/createDeposit", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const savedDeposit = await deps.createDepositUseCase.execute(req.body);
            return res.status(201).json(savedDeposit);
        } catch (error) {
            next(error);
        }
    });

    router.get("/getDeposits", async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const ownerId = String(req.user.id);
            const deposits = await deps.getDepositsUseCase.execute(ownerId);
            return res.status(200).json(deposits);
        } catch (error) {
            next(error);
        }
    });

    router.delete("/deleteDeposit/:id", requireOwner, async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const depositId = String(req.params.id);
            const deletedDeposit = await deps.deleteDepositUseCase.execute(depositId);
            return res.status(200).json(deletedDeposit);
        } catch (error) {
            next(error);
        }
    });

    router.put("/updateDeposit/:id", requireAdmin, async (req: AuthRequest, res: Response, next: NextFunction) => {
        try {
            const depositId = String(req.params.id);
            const updatedDeposit = await deps.updateDepositUseCase.execute(depositId, req.body);
            return res.status(200).json(updatedDeposit);
        } catch (error) {
            next(error);
        }
    });

    return router;
}

export default DepositRouter;


