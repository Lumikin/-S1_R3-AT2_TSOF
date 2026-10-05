import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { MontadoraFactory } from "./factories/montadoraFactory.js";
import { response } from "express";

describe("API montadoras", () => {
  beforeEach(async () => {
    await MontadoraFactory.create("Toyota", "Japão");
    await MontadoraFactory.create("Honda", "Japão");
    await MontadoraFactory.create("Ford", "USA");

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();

    vi.resetAllMocks();
  });

  it("Deve criar uma montadora com sucesso.", async () => {
    const response = await request(app).post("/montadoras").send({
      nome: "hyundai",
      pais: "Coreia do Sul",
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty("insertId");
  });
});
describe
