# Usa una imagen base de Node.js
# FROM node:18-alpine
FROM node:latest

# ENV NODE_VERSION 18.14.1
ENV NODE_VERSION 20.7.0

# Establece el directorio de trabajo en el contenedor
WORKDIR /usr/src/app
RUN curl -fsSL https://bun.sh/install | bash 


# Copia los archivos de configuración (package.json y pnpm-lock.yaml) al contenedor
COPY package.json bun.lockb ./

# Instala las dependencias utilizando PNPM
RUN bun install

# Copia el resto del código fuente al contenedor
COPY . .


# Expone el puerto en el que la aplicación se ejecutará dentro del contenedor
EXPOSE 3000

# Define el comando para ejecutar la aplicación
CMD [ "bun", "start" ]
