/*

import { Request, Response } from "express";
import { TaxProfileService } from "../service/tax-profile.service.impl";
import {logger} from "../shared/logger";
import { TaxProfileMapper } from "../mapper/tax-profile-mapper";

export class TaxProfileController {
  constructor(private service: TaxProfileService) {}

  async getTaxProfiles(req: Request, res: Response) {
    const result = await this.service.getTaxProfiles(req.query);
    res.setHeader("X-Total-Count", result.total);
    res.json(result);
  }

  async getTaxProfileById(req: Request, res: Response) {
    const profile = await this.service.getTaxProfileById(req.params.id);
    res.json(TaxProfileMapper.toTaxProfileResponse(profile));
  }

  async createTaxProfile(req: Request, res: Response) {
    const id = await this.service.createTaxProfile(req.body);
    res.status(201).json({ id });
  }

  async updateTaxProfile(req: Request, res: Response) {
    const profile = await this.service.updateTaxProfile(req.params.id, req.body);
    res.json(TaxProfileMapper.toTaxProfileResponse(profile));
  }

  async deleteTaxProfile(req: Request, res: Response) {
    await this.service.deleteTaxProfile(req.params.id);
    res.status(204).send();
  }
}

*/