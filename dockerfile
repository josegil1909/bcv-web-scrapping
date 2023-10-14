FROM oven/bun:canary-alpine
WORKDIR /usr/src/app

COPY package.json bun.lockb ./

RUN bun install

# Expone el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

CMD ["bun", "start"]

# Define el comando para ejecutar la aplicación