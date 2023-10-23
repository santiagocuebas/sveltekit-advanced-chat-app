# Svelte Chat
Svelte Chat is a web application to chatting.
![image](/docs/screenshot1.png)
![image](/docs/screenshot2.png)

## Enviroment Variables
### Client
* `PORT`, the http client port.
* `PUBLIC_DIR`, the http server port.
### Server
* `PORT`, the http server port.
* `MONGO_URI`, the mongodb database uri.
* `MONGO_REPLIC`, the mongodb database replic set uri.
* `SOCKETS_DB`, database name of replic set.
* `COLLECTION`, collection name of replic set.
* `SECRET`, the JWT secret.
* `DOMAIN`, domain of the server cookie.
* `NODE_ENV`, indicates if the cookie is secure.
* `ORIGIN`, the http client port.

## Installation
```
git clone https://github.com/santiagocuebas/sveltekit-advanced-chat-app
cd sveltekit-advanced-chat-app
cd backend
pnpm install
npm run build
npm start
cd frontend
pnpm install
npm run build
npm start
```

## Resources
* Node.js
* Express
* MongoDB
* Typescript
* Socket.io
* SvelteKit
* Tailwind.css

## Future Improvements
- [ ] Update syntax a Svelte 5
