import request from "supertest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import app from "../src/app.js";
import { clearDatabase } from "./utils/clearDatabase.js";
import { MontadoraFactory } from "./factories/montadoraFactory.js";
import montadoraRepository from "../src/repositories/montadoraRepository.js";

describe("API montadoras", () => {
  let toyota;

  // Criação de Mocks
  beforeEach(async () => {
    toyota = await MontadoraFactory.create("Toyota", "Japão");
    await MontadoraFactory.create("Honda", "Japão");
    await MontadoraFactory.create("Ford", "USA");

    vi.clearAllMocks();
  });

  afterEach(async () => {
    await clearDatabase();

    vi.restoreAllMocks();
  });

  describe("Criar montadoras", () => {
    it("Deve criar uma montadora com sucesso.", async () => {
      const response = await request(app).post("/montadoras").send({
        nome: "hyundai",
        pais: "Coreia do Sul",
      });

      expect(response.status).toBe(201);
    });
    it("Deve retornar 500 quando o repository falhar.", async () => {
      vi.spyOn(montadoraRepository, "criar").mockRejectedValue(
        // mockRejectedValue simula um erro
        new Error("Falha no banco"),
      );

      const response = await request(app).post("/montadoras").send({
        nome: "Kia",
        pais: "Coreia do Sul",
      });

      expect(response.status).toBe(500);
    });
  });

  describe("Alterar montadora", () => {
    it("Deve atualizar uma montadora com sucesso.", async () => {
      let id;
      if (!toyota.id) {
        id = toyota.insertId;
      } else {
        id = toyota.id;
      }

      const response = await request(app)
        .put("/montadoras")
        .query({ id })
        .send({ nome: "Toyota Motor", pais: "Japão" });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Montadora atualizada com sucesso");
    });

    it("Deve retornar 404 quando a montadora não existir.", async () => {
      const response = await request(app)
        .put("/montadoras")
        .query({ id: 6767 })
        .send({ nome: "null", pais: "null" });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Montadora não encontrada");
    });

    it("Deve retornar 500 quando o repository falhar.", async () => {
      vi.spyOn(montadoraRepository, "editar").mockRejectedValue(
        new Error("Falha no banco"),
      );

      const response = await request(app)
        .put("/montadoras")
        .query({ id: 1 })
        .send({ nome: "Toyota", pais: "Japão" });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao atualizar montadora");
    });
  });

  describe("Deletar uma montadora", () => {
    it("Deve deletar uma montadora com sucesso.", async () => {
      let id;
      if (!toyota.id) {
        id = toyota.insertId;
      } else {
        id = toyota.id;
      }

      const response = await request(app).delete(`/montadoras/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Montadora deletada com sucesso");
    });

    it("Deve retornar 404 quando a montadora não existir.", async () => {
      const response = await request(app).delete("/montadoras/6789");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Montadora não encontrada");
    });

    it("Deve retornar 500 quando o repository falhar.", async () => {
      vi.spyOn(montadoraRepository, "deletar").mockRejectedValue(
        new Error("Falha no banco"),
      );

      const response = await request(app).delete("/montadoras/1");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao deletar montadora");
    });
  });

  describe("Listar montadoras", () => {
    it("Deve listar as montadoras com sucesso.", async () => {
      const response = await request(app).get("/montadoras");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Montadoras selecionadas com sucesso");
    });
  });
});
