import { Router } from "express";
import { InvoiceController } from "../controller/invoice.controller";
import { verifyToken, requireRole} from "../middleware/auth";
import { UserRole } from "../api/dto";

export function buildInvoiceRouter() {
  const router = Router();
  const controller = new InvoiceController();

  router.get("/",  verifyToken, controller.getInvoices);
  router.post("/", verifyToken, requireRole(UserRole.ADMIN), controller.createInvoice);
  router.get("/:id", verifyToken, controller.getInvoiceById);
  router.put("/:id", verifyToken, requireRole(UserRole.ADMIN), controller.updateInvoice);
  router.delete("/:id", verifyToken, requireRole(UserRole.ADMIN), controller.deleteInvoice);
  return router;
}
