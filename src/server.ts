import fastify from "fastify";
import cors from "@fastify/cors";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import { AddressInfo } from 'net';

const server = fastify({ logger: true });

server.register(cors, {
  origin: "*",
});


interface Team {
  id: number;
  name: string;
  base: string;
}

interface Driver {
  id: number;
  name: string;
  team: string;
}


const teams: Team[] = [
  { id: 1, name: "McLaren", base: "Woking, United Kingdom" },
  { id: 2, name: "Mercedes", base: "Brackley, United Kingdom" },
  { id: 3, name: "Red Bull Racing", base: "Milton Keynes, United Kingdom" },
  { id: 4, name: "Ferrari", base: "Maranello, Italy" },
  { id: 5, name: "Alpine", base: "Enstone, United Kingdom" },
  { id: 6, name: "Aston Martin", base: "Silverstone, United Kingdom" },
  { id: 7, name: "Alfa Romeo Racing", base: "Hinwil, Switzerland" },
  { id: 8, name: "AlphaTauri", base: "Faenza, Italy" },
  { id: 9, name: "Williams", base: "Grove, United Kingdom" },
  { id: 10, name: "Haas", base: "Kannapolis, United States" },
  { id: 11, name: "Uralkali Haas F1 Team", base: "Banbury, United Kingdom" },
  { id: 12, name: "Scuderia Toro Rosso", base: "Faenza, Italy" },
];

const drivers: Driver[] = [
  { id: 1, name: "Max Verstappen", team: "Red Bull Racing" },
  { id: 2, name: "Lewis Hamilton", team: "Mercedes" },
  { id: 3, name: "Lando Norris", team: "McLaren" },
];


server.register(swagger, {
  swagger: {
    info: {
      title: "F1 API",
      description: "API para informações sobre a Fórmula 1",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "site swagger",
    },
    host: "localhost:3333", //porta de acesso
    schemes: ["http"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [
      { name: "teams", description: "F1 endpoints de times" },
      { name: "drivers", description: "F1 endpoints de pilotos" },
    ],
  },
});


server.register(swaggerUi, {
  routePrefix: "/docs", 
  uiConfig: {
    docExpansion: "full",
    deepLinking: false,
  },
  uiHooks: {
    onRequest: function (request, reply, next) {
      next();
    },
    preHandler: function (request, reply, next) {
      next();
    },
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
}).after((err) => {
  if (err) console.error("falha ao registrar o swagger", err);
  else console.log("swagger ui registrada com sucesso");
});

// Rota de teste
server.get("/test", {
  schema: {
    description: "Testando endpoint",
    tags: ["test"],
    response: {
      200: {
        description: "Teste bem-sucedido",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  handler: (request, reply) => {
    reply.send({ message: "O server está funcionando" });
  },
});

server.get("/teams", {
  schema: {
    description: "Get all F1 teams",
    tags: ["teams"],
    response: {
      200: {
        description: "Successful response",
        type: "object",
        properties: {
          teams: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                name: { type: "string" },
                base: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  handler: async (request, reply) => {
    reply.send({ teams });
  },
});


server.get("/drivers", {
  schema: {
    description: "Seleciona todos os pilotos",
    tags: ["drivers"],
    response: {
      200: {
        description: "Resposta bem sucedida",
        type: "object",
        properties: {
          drivers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                name: { type: "string" },
                team: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
  handler: async (request, reply) => {
    reply.send({ drivers });
  },
});

server.get<{ Params: { id: string } }>("/drivers/:id", {
  schema: {
    description: "pega um piloto pelo id",
    tags: ["drivers"],
    params: {
      type: "object",
      properties: {
        id: { type: "string", description: "Driver ID" },
      },
    },
    response: {
      200: {
        description: "re",
        type: "object",
        properties: {
          driver: {
            type: "object",
            properties: {
              id: { type: "number" },
              name: { type: "string" },
              team: { type: "string" },
            },
          },
        },
      },
      404: {
        description: "piloto não encontrado",
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  handler: async (request, reply) => {
    const id = parseInt(request.params.id);
    const driver = drivers.find((d) => d.id === id);

    if (!driver) {
      reply.code(404).send({ message: "piloto não encontrado" });
    } else {
      reply.send({ driver });
    }
  },
});

// iniciando o servidor
const start = async () => {
  try {
    await server.listen({ port: 3333, host: "0.0.0.0" });
    const address = server.server.address();
    if (address && typeof address === 'object') {
      console.log(`Server listening at http://localhost:${address.port}`);
    } else {
      console.log(`Server listening on ${address}`);
    }
    console.log("documentação disponível em http://localhost:3333/docs");
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
