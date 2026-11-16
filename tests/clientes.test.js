import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import axios from "axios";
import app from "../src/app.js";
import { clearDatabase } from "./utils/clearDatabase.js";

// Mock do Axios
vi.mock("axios");

const mockAxios = vi.mocked(axios);

describe("API Clientes", () => {
  // Dados padrão para os testes
  const clienteValido = {
    nome: "Lucas Miranda",
    cpf: "825.999.960-90",
    cep: "13050-470",
    numero: 68,
    complemento: "Não tem",
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock padrão do ViaCEP
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

  describe("Criar um cliente", () => {
    it("deve criar um cliente com informações válidas", async () => {
      const response = await request(app).post("/clientes").send(clienteValido);

      expect(response.status).toBe(201);
    });

    it("deve rejeitar informações inválidas", async () => {
      const response = await request(app).post("/clientes").send({
        nome: "Lucas Miranda",
        cpf: "825.999.",
        cep: "13050-4",
        numero: null,
        complemento: "Não tem",
      });

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Erro ao criar cliente");
    });

    it("deve consultar o ViaCEP durante a criação", async () => {
      await request(app).post("/clientes").send(clienteValido);
    });

    it("deve retornar erro quando o ViaCEP falhar", async () => {
      mockAxios.get.mockRejectedValueOnce(
        new Error("Erro ao consultar ViaCEP"),
      );

      const response = await request(app).post("/clientes").send(clienteValido);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao criar cliente");
    });

    it("deve retornar erro quando o CEP não existir", async () => {
      mockAxios.get.mockResolvedValueOnce({
        data: {
          erro: true,
        },
      });

      const response = await request(app).post("/clientes").send(clienteValido);

      expect(response.status).toBe(500);
    });
  });

  describe("Selecionar clientes", () => {
    it("deve retornar uma lista de clientes", async () => {
      await request(app).post("/clientes").send(clienteValido);

      const response = await request(app).get("/clientes");

      expect(response.status).toBe(200);
    });

    it("deve retornar uma lista vazia quando não houver clientes", async () => {
      const response = await request(app).get("/clientes");

      expect(response.status).toBe(200);
    });
  });

  describe("Atualizar Clientes", () => {
    it("deve atualizar um cliente existente", async () => {
      const criado = await request(app).post("/clientes").send(clienteValido);

      const id = criado.body.data.id;

      const response = await request(app)
        .put(`/clientes?id=${id}`)
        .send({
          ...clienteValido,
          nome: "Lucas Atualizado",
          numero: 100,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Cliente atualizado com sucesso");
    });

    it("deve retornar erro ao atualizar com informações inválidas", async () => {
      const criado = await request(app).post("/clientes").send(clienteValido);

      const id = criado.body.data.id;

      const response = await request(app).put(`/clientes?id=${id}`).send({
        nome: "",
        cpf: "123",
        cep: "00000-000",
        numero: null,
        complemento: "",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao atualizar cliente");
    });
  });

  describe("Deletar clientes", () => {
    it("deve deletar um cliente existente", async () => {
      const criado = await request(app).post("/clientes").send(clienteValido);

      const id = criado.body.data.id;

      const response = await request(app).delete(`/clientes/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Cliente deletado com sucesso");
    });
  });
});
