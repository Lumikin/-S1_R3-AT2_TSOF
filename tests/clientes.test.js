import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";
import app from "../src/app.js";
import { clearDatabase } from "./utils/clearDatabase.js";

// Configura o módulo para ser mockeado
vi.mock("axios");

// Ultilização do módulo
const mockAxios = vi.mocked(axios);

describe("API clientes", () => {
  beforeEach(async () => {
    // Limpa os Mocks
    vi.clearAllMocks();

    // Mock Axios
    mockAxios.get.mockResolvedValue({
      data: {
        cep: "13050-470",
        logradouro: "Avenida Mirandópolis",
        bairro: "Vila Pompéia",
        localidade: "Campinas",
        uf: "SP",
      },
    });
  });

  afterEach(async () => {
    await clearDatabase();
  });

  it("Criar um usuario com informações válidas", async () => {
    const response = await request(app).post("/clientes").send({
      nome: "Lucas Miranda",
      cpf: "825.999.960-90",
      cep: "13050-470",
      numero: 68,
      complemento: "não tem",
    });

    expect(response.status).toBe(201);
  });

  it("Criar um usuario com informações inválidas", async () => {
    const response = await request(app).post("/clientes").send({
      nome: "Lucas Miranda",
      cpf: "825.999.",
      cep: "13050-4",
      numero: null,
      complemento: "não tem",
    });

    expect(response.status).toBe(500);
  });
});
