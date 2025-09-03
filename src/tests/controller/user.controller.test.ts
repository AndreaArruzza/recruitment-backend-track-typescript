/*
import  request from "supertest";
import express, { Application } from "express";

import bodyParser from "body-parser";
import { UserController } from "../../controller/user.controller";
import { UserServiceImpl } from "../../service/user.service.impl";
import { prisma, cleanDatabase } from "../db-setup"; 
import { UserRepositoryImpl } from "../../repository/user.repository.impl";
import { UserMapper } from "../../mapper/user.mapper";


describe("UserController (integration)", () => {
  let app: Application;

  beforeAll(async () => {
    app = express();
    app.use(bodyParser.json());
    let repo = new UserRepositoryImpl(prisma);
    let service = new UserServiceImpl(repo, prisma);
    // monta il controller
    const controller = new UserController(service);
    app.get("/users", controller.getUsers);
    app.post("/users", controller.createUser);
    app.get("/users/:id", controller.getUserById);
    app.put("/users/:id", controller.updateUserById);
    app.patch("/users/:id", controller.patchUserById);
    app.delete("/users/:id", controller.deleteUserById);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  describe("POST /users", () => {
    it("should create a new user", async () => {
      const res = await request(app)
        .post("/users")
        .send({
          id: 1,
          firstName: "Mario",
          lastName: "Rossi",
          email: "mario.rossi@example.com",
          phone: "3331234567",
        })
        .expect(201);

      expect(res.body).toHaveProperty("id");
      expect(res.body.firstName).toBe("Mario");
    });
  });

  describe("GET /users", () => {
    it("should return paginated users", async () => {
      await prisma.user.createMany({
        data: [
          { firstName: "Mario", lastName: "Rossi", email: "mario@example.com" , passwordHash: "hduehdu"},
          { firstName: "Luca", lastName: "Bianchi", email: "luca@example.com", passwordHash:"iuhfehfu"},
        ],
      });

      const res = await request(app).get("/users").expect(200);

      expect(res.headers).toHaveProperty("x-total-count");
      expect(res.body.total).toBe(2);
    });
  });

  describe("GET /users/:id", () => {
    it("should return user by id", async () => {
      const created = await prisma.user.create({
        data: {id:1, firstName: "Anna", lastName: "Verdi", email: "anna@example.com", passwordHash: "hduehdu" },
      });

      const encrypt = UserMapper.encryptAES(created.id.toString());

      const res = await request(app).get(`/users/${encrypt}`).expect(200);

      expect(res.body.id).toBe(created.id);
      expect(res.body.firstName).toBe("Anna");
    });
  });

  describe("PUT /users/:id", () => {
    it("should update user", async () => {
      const created = await prisma.user.create({
        data: { firstName: "Luca", lastName: "Bianchi", email: "luca@example.com", passwordHash: "hduehdu" },
      });

      const encrypt = "U2FsdGVkX19Yff/7X3HkhkDlGqMOCVty3ZlXQ+iNgRo=";

      const res = await request(app)
        .put(`/users/${encrypt}`)
        .send({ firstName: "Luca Updated", lastName: "Bianchi", email: "luca@example.com" })
        .expect(200);

      expect(res.body.firstName).toBe("Luca Updated");
    });
  });

  describe("PATCH /users/:id", () => {
    it("should patch user", async () => {
      const created = await prisma.user.create({
        data: { firstName: "Marco", lastName: "Neri", email: "marco@example.com", passwordHash: "hduehdu" },
      });

      const encrypt = UserMapper.encryptAES(created.id.toString());

      const res = await request(app)
        .patch(`/users/${encrypt}`)
        .send({ firstName: "Marco Patched" })
        .expect(200);

      expect(res.body.firstName).toBe("Marco Patched");
    });
  });

  describe("DELETE /users/:id", () => {
    it("should delete user", async () => {
      const created = await prisma.user.create({
        data: { firstName: "Giulia", lastName: "Blu", email: "giulia@example.com", passwordHash: "hduehdu"},
      });
      const encrypt = UserMapper.encryptAES(created.id.toString());

      await request(app).delete(`/users/${encrypt}`).expect(204);

      const found = await prisma.user.findUnique({ where: { id: created.id } });
      expect(found).toBeNull();
    });
  });
});
*/