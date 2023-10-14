FROM oven/bun:latest

COPY package.json ./
COPY bun.lockb ./
COPY src ./

RUN bun install

# Expone el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD [ "bun", "start" ]