# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

# ---- serve ----
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# 127.0.0.1, not localhost: busybox wget resolves localhost to ::1 and nginx listens on IPv4 only
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 CMD wget -qO /dev/null http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
