import { InvoiceServiceImpl } from "../../service/invoice.service.impl";
import { InvoiceRepositoryImpl } from "../../repository/invoice.repository.impl";
import { prisma, cleanDatabase } from "../db-setup";
import { InvoiceStatus, Prisma, InvoiceItem, TaxType, PaymentMethod } from "@prisma/client";
import { BadRequestError, NotFoundError } from "../../error/http-errors";
import { validCreateDto, invoiceItems } from "../fixture/invoice.fixture";
import { Decimal } from "@prisma/client/runtime/client";

const createIssuerUser = async () => {
  const user = await prisma.user.create({
    data: {
      email: `issuer.${Date.now()}@test.io`,
      passwordHash: "x",
      firstName: "Issuer",
      lastName: "User",
      role: "ADMIN",
      isEnabled: true,
    },
    select: { id: true },
  });

  const tp = await prisma.userTaxProfile.create({
    data: {
      userId: user.id,
      type: "COMPANY",
      legalName: "Issuer SRL",
      fiscalCode: "ISSRXX00X00X000X",
      vatNumber: "IT12345678901",
      addressLine1: "Via Roma 1",
      city: "Roma",
      postalCode: "00100",
      countryCode: "IT",
    },
    select: { id: true },
  });

  return { userId: user.id, userTaxProfileId: tp.id };
};

const createCustomer = async () => {
  const customer = await prisma.customer.create({
    data: {
      firstName: "Cliente Test",
      email: `customer.${Date.now()}@test.io`,
   
    phone:  null,

    lastName: "2",
    isEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date()
    },
    select: { id: true },
  });

  const tp = await prisma.customerTaxProfile.create({
    data: {
      customerId: customer.id,
      legalName: "Cliente SRL",
      fiscalCode: "CLNTXX00X00X000X",
      addressLine1: "Via Milano 1",
      city: "Milano",
      postalCode: "20100",
      countryCode: "IT",
      type: TaxType.COMPANY
    },
    select: { id: true },
  });

  return { customerId: customer.id, customerTaxProfileId: tp.id };
};

describe("InvoiceService (integrazione con repo + prisma di test)", () => {
  let service: InvoiceServiceImpl;
  let repo: InvoiceRepositoryImpl;

  beforeEach(async () => {
    await cleanDatabase();
    repo = new InvoiceRepositoryImpl(prisma);
    service = new InvoiceServiceImpl(repo, prisma);
  });

  // ============ getInvoices ============
  it("should return paginated invoices", async () => {
    const { userId, userTaxProfileId } = await createIssuerUser();
    const items: InvoiceItem[] = [];

    for (let i = 0; i < 2; i++) {
      await repo.create(
        {
          invoiceNumber: BigInt(Date.now() + i),
          issueDate: new Date(),
          currency: "EUR",
          status: InvoiceStatus.DRAFT,
          issuerUserId: userId,
          issuerTaxProfileId: userTaxProfileId,
          subtotal: new Prisma.Decimal("0"),
          taxTotal: new Prisma.Decimal("0"),
          grandTotal: new Prisma.Decimal("0"),
        },
        items
      );
    }

    const res = await service.getInvoices(1, 10, {});
    expect(res.total).toBeGreaterThanOrEqual(2);
    expect(Array.isArray(res.data)).toBe(true);
  });

  // ============ getInvoiceById ============
  it("should throw NotFoundError if invoice does not exist", async () => {
    await expect(service.getInvoiceById(BigInt(999999))).rejects.toBeInstanceOf(
      NotFoundError
    );
  });

  it("should return created invoice by id", async () => {
    const { userId, userTaxProfileId } = await createIssuerUser();
    const items: InvoiceItem[] = [];
    const created = await repo.create(
      {
        invoiceNumber: BigInt(Date.now()),
        issueDate: new Date(),
        currency: "EUR",
        status: InvoiceStatus.DRAFT,
        issuerUserId: userId,
        issuerTaxProfileId: userTaxProfileId,
        subtotal: new Prisma.Decimal("0"),
        taxTotal: new Prisma.Decimal("0"),
        grandTotal: new Prisma.Decimal("0"),
      },
      items
    );

    const found = await service.getInvoiceById(BigInt(created.id));
    expect(found).toBeDefined();
    expect(found.idInvoice.toString()).toBe(created.id);
  });



  it("should throw BadRequestError if status != DRAFT but no customer", async () => {
    const { userId, userTaxProfileId } = await createIssuerUser();

    await expect(
      service.createInvoice({
        ...validCreateDto(userId, userTaxProfileId, false, true),
        status: InvoiceStatus.ISSUED,
      } as any)
    ).rejects.toBeInstanceOf(BadRequestError);
  });

  it("should create invoice with customer when status != DRAFT", async () => {
    const { userId, userTaxProfileId } = await createIssuerUser();
    const { customerId, customerTaxProfileId } = await createCustomer();

    const created = await service.createInvoice({
      ...validCreateDto(userId, userTaxProfileId, true, true),
      status: InvoiceStatus.ISSUED,
      billToCustomerId: customerId.toString(),
      billToCustomerTaxProfileId: customerTaxProfileId.toString(),
    } as any);

    expect(created).toHaveProperty("id");
  });

  // ============ updateInvoice ============
 it("should replace items on update", async () => {
  const { userId, userTaxProfileId } = await createIssuerUser();
  const items: InvoiceItem[] = [];

  // 1. Creo la fattura iniziale
  const created = await repo.create(
    {
      invoiceNumber: BigInt(212345),
      issueDate: new Date(),
      currency: "EUR",
      status: InvoiceStatus.DRAFT,
      issuerUserId: userId,
      issuerTaxProfileId: userTaxProfileId,
      subtotal: new Prisma.Decimal("0"),
      taxTotal: new Prisma.Decimal("0"),
      grandTotal: new Prisma.Decimal("0"),
    },
    items
  );

  const id = BigInt(created.id);

  // 2. Aggiungo un item "vecchio"
  await prisma.invoiceItem.create({
    data: {
      invoiceId: id,
      codProduct: "CONS-001",
      description: "Old item",
      quantity: new Prisma.Decimal("1"),
      unitPrice: new Prisma.Decimal("10"),
      taxRate: new Prisma.Decimal("0.22"),
      lineTotal: new Prisma.Decimal("12.2"),
    },
  });

  // 3. Aggiorno la fattura con i nuovi item
  const updated = await service.updateInvoice(id, {
    issueDate: new Date(),
    dueDate: new Date(),
    currency: "EUR",
    paymentMethod: PaymentMethod.CARD,
    subtotal: new Decimal(1.99),
    taxTotal: new Decimal(2.00),
    grandTotal: new Decimal(2.99),
    items: invoiceItems(),                
  });

  // 4. Asserzioni
  expect(updated.id).toBe(id);

  const itemsReturn = await prisma.invoiceItem.findMany({
    where: { invoiceId: id },
  });

  expect(itemsReturn.length).toBe(2);
  expect(itemsReturn.some((i) => i.description === "Old item")).toBe(false);
});

  // ============ deleteInvoice ============
  it("should delete invoice and its items", async () => {
    const { userId, userTaxProfileId } = await createIssuerUser();
    const items: InvoiceItem[] = [];

    const created = await repo.create(
      {
        invoiceNumber: BigInt(Date.now()),
        issueDate: new Date(),
        currency: "EUR",
        status: InvoiceStatus.DRAFT,
        issuerUserId: userId,
        issuerTaxProfileId: userTaxProfileId,
        subtotal: new Prisma.Decimal("0"),
        taxTotal: new Prisma.Decimal("0"),
        grandTotal: new Prisma.Decimal("0"),
      },
      items
    );

    const id = BigInt(created.id);

    await prisma.invoiceItem.create({
      data: {
        invoiceId: id,
        codProduct: "CONS-001",
        description: "To be deleted",
        quantity: new Prisma.Decimal("1"),
        unitPrice: new Prisma.Decimal("10"),
        taxRate: new Prisma.Decimal("0.22"),
        lineTotal: new Prisma.Decimal("12.2"),
      },
    });

    await service.deleteInvoice(id);

    const inv = await prisma.invoice.findUnique({ where: { id } });
    expect(inv).toBeNull();

    const itemsReturn = await prisma.invoiceItem.findMany({
      where: { invoiceId: id },
    });
    expect(itemsReturn.length).toBe(0);
  });
});
