# Usa una imagen base de Node.js
# FROM node:18-alpine
FROM node:latest

RUN  curl -fsSL https://bun.sh/install | bash
# ENV NODE_VERSION 18.14.1
ENV NODE_VERSION 20.7.0

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app


# Copia los archivos de configuración (package.json y pnpm-lock.yaml) al contenedor
COPY package.json pnpm-lock.yaml ./


# Instala las dependencias utilizando PNPM
RUN yarn install

# Copia el resto del código fuente al contenedor
COPY . .


# Expone el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD [ "yarn", "start" ]