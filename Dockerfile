# Section development
FROM node:20 AS development
WORKDIR /app
COPY package*.json ./
RUN npm  install
COPY . .
RUN npx prisma generate
RUN npm run build
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["sh", "/usr/local/bin/entrypoint.sh"]

# Section production
FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
COPY --from=development /app/dist ./dist
COPY --from=development /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]