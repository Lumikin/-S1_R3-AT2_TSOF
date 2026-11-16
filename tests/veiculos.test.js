import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import app from "../src/app.js";
import { clearDatabase } from "./utils/clearDatabase.js";

describe("API Veículos", () => {
  const clienteValido = {
    nome: "Lucas Miranda",
    cpf: "825.999.960-90",
    cep: "13050-470",
    numero: 68,
    complemento: "Não tem",
  };

  const montadoraValida = {
    nome: "Toyota",
    pais: "Japão",
  };

  const veiculoValido = {
    modelo: "Corolla",
    placa: "ABC1D23",
    ano: 2024,
    cor: "Preto",
    valor: 150000,
  };

  let idCliente;
  let idMontadora;

  beforeEach(async () => {
    const cliente = await request(app).post("/clientes").send(clienteValido);

    expect(cliente.status).toBe(201);
    idCliente = cliente.body.data.insertId;

    const montadora = await request(app)
      .post("/montadoras")
      .send(montadoraValida);

    expect(montadora.status).toBe(201);
    idMontadora = montadora.body.data.insertId;
  });

  afterEach(async () => {
    await clearDatabase();
  });

  const criarVeiculo = () =>
    request(app)
      .post("/veiculos")
      .send({
        ...veiculoValido,
        idCliente,
        idMontadora,
      });

  describe("Criar veículos", () => {
    it("deve criar um veículo com informações válidas", async () => {
      const response = await criarVeiculo();

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Veículo criado com sucesso");
      expect(response.body.data).toHaveProperty("insertId");
      expect(response.body.data).toHaveProperty("affectedRows", 1);
    });

    it("deve rejeitar informações inválidas", async () => {
      const response = await request(app).post("/veiculos").send({
        idCliente,
        idMontadora,
        modelo: "",
        placa: "",
        ano: null,
        cor: "",
        valor: -1,
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao criar veículo");
    });

    it("deve rejeitar uma montadora inexistente", async () => {
      const response = await request(app)
        .post("/veiculos")
        .send({
          ...veiculoValido, //Persiste os dados
          idCliente,
          idMontadora: 6789,
        });

      expect(response.status).toBe(500);
    });

    it("deve rejeitar um cliente inexistente", async () => {
      const response = await request(app)
        .post("/veiculos")
        .send({
          ...veiculoValido,
          idCliente: 6789,
          idMontadora,
        });

      expect(response.status).toBe(500);
    });
  });

  describe("Selecionar veículos", () => {
    it("deve retornar uma lista de veículos", async () => {
      await criarVeiculo();

      const response = await request(app).get("/veiculos");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Veículos selecionados com sucesso");
    });

    it("deve retornar uma lista vazia quando não houver veículos", async () => {
      const response = await request(app).get("/veiculos");

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
    });
  });

  describe("Atualizar veículos", () => {
    it("deve atualizar um veículo existente", async () => {
      const criado = await criarVeiculo();
      const id = criado.body.data.insertId;

      const response = await request(app)
        .put(`/veiculos?id=${id}`)
        .send({
          ...veiculoValido,
          idCliente,
          idMontadora,
          modelo: "Corolla Cross",
          cor: "Branco",
          valor: 180000,
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Veículo atualizado com sucesso");
      expect(response.body.data).toHaveProperty("affectedRows", 1);
    });

    it("deve rejeitar informações inválidas", async () => {
      const criado = await criarVeiculo();
      const id = criado.body.data.insertId;

      const response = await request(app).put(`/veiculos?id=${id}`).send({
        idCliente,
        idMontadora,
        modelo: "",
        placa: "",
        ano: null,
        cor: "",
        valor: -1,
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Erro ao atualizar veículo");
    });

    it("deve retornar erro ao atualizar um veículo inexistente", async () => {
      const response = await request(app)
        .put("/veiculos/kasdmkaskmsakdmkm")
        .send({
          ...veiculoValido,
          idCliente,
          idMontadora,
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Veículo não encontrado");
    });

    it("deve rejeitar uma montadora inexistente", async () => {
      const criado = await criarVeiculo();
      const id = criado.body.data.insertId;

      const response = await request(app)
        .put(`/veiculos?id=${id}`)
        .send({
          ...veiculoValido,
          idCliente,
          idMontadora: 6789,
        });

      expect(response.status).toBe(500);
    });
  });

  describe("Deletar veículos", () => {
    it("deve deletar um veículo existente", async () => {
      const criado = await criarVeiculo();
      const id = criado.body.data.insertId;

      const response = await request(app).delete(`/veiculos/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Veículo deletado com sucesso");
      expect(response.body.data).toHaveProperty("affectedRows", 1);

      const consulta = await request(app).get("/veiculos");

      expect(consulta.body.data).toHaveLength(0);
    });

    it("deve retornar erro ao deletar com ID inválido", async () => {
      const response = await request(app).delete("/veiculos/?asd");

      expect(response.status).toBe(404);
    });
  });
});
