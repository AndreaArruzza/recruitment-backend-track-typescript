import type { Request, Response, NextFunction } from "express";
import { logger } from "../shared/logger";
import { InvoiceServiceImpl } from "../service/invoice.service.impl";
import { InvoiceMapper } from "../mapper/invoice.mapper";

export class InvoiceController {
  constructor(private readonly service = new InvoiceServiceImpl()) {}

  private log = logger.child({ module: "InvoiceController" });

  
  getInvoices = async (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    try {
      const page = req.query.page ? Number(req.query.page) : 1;
      const pageSize = req.query.pageSize ? Number(req.query.pageSize) : 20;

      this.log.debug({ page, pageSize, req },"getInvoices: retrieving invoices with filters");

      const result = await this.service.getInvoices(page, pageSize,
                    InvoiceMapper.fromInvoiceRequestToFilterDto(req));

      res.setHeader("X-Total-Count", String(result.total));
      this.log.debug("retrieve all invoices = OK")

      return res.status(200).json(result);
    } catch (error) {
      this.log.error(
        { err: error, ms: Date.now() - startedAt },
        "getInvoices: FAILED"
      );
      next(error);
    }
  };

  
  createInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const startedAt = Date.now();
    try {
      this.log.debug("createInvoice: creating new invoice...");

      const created = await this.service.createInvoice(req.body);

      this.log.debug(
        { id: created.id, ms: Date.now() - startedAt },
        "createInvoice: OK"
      );
      return res.status(201).json(created);
    } catch (error) {
      this.log.error({ err: error }, "createInvoice: FAILED");
      next(error);
    }
  };


  getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const startedAt = Date.now();
    try {
      this.log.debug({ id }, "getInvoiceById: retrieving invoice...");
      const invoice = await this.service.getInvoiceById(InvoiceMapper.convertId(id));

      this.log.debug({ id, ms: Date.now() - startedAt }, "getInvoiceById: OK");
      return res.status(200).json(invoice);
    } catch (error) {
      this.log.error({ id, err: error }, "getInvoiceById: FAILED");
      next(error);
    }
  };

  /**
   * PUT /invoices/:id
   */
  updateInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const startedAt = Date.now();
    try {
      this.log.debug(
        { id, bodyKeys: Object.keys(req.body ?? {}) },
        "updateInvoice: updating invoice..."
      );

      const updated = await this.service.updateInvoice(InvoiceMapper.convertId(id), req.body);

      this.log.debug({ id, ms: Date.now() - startedAt },"updateInvoice: OK");
      return res.status(200).json(InvoiceMapper.toInvoiceResponse(updated));
    } catch (error) {
      this.log.error({ id, err: error }, "updateInvoice: FAILED");
      next(error);
    }
  };

  /**
   * DELETE /invoices/:id
   */
  deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const startedAt = Date.now();
    try {
      this.log.debug({ id }, "deleteInvoice: deleting invoice...");
      await this.service.deleteInvoice(InvoiceMapper.convertId(id));

      this.log.debug(
        { id, ms: Date.now() - startedAt },
        "deleteInvoice: OK"
      );
      return res.status(204).send();
    } catch (error) {
      this.log.error({ id, err: error }, "deleteInvoice: FAILED");
      next(error);
    }
  };
}
