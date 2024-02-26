# SvChat
SvChat is a web application to chatting.
![image](/docs/screenshot1.png)
![image](/docs/screenshot2.png)

## Enviroment Variables
### Client
* `PUBLIC_DIR`, the http server port.
* `PUBLIC_GITHUB_ID`, the github oauth client id.
### Server
* `PORT`, the http server port.
* `SECRET`, the JWT secret.
* `ORIGIN`, the http client port.
* `GITHUB_ID`, the github oauth client id.
* `GITHUB_SECRET`, the github oauth client secret.
* `MONGO_URI`, the mongodb database uri.
* `MONGO_REPLIC`, the mongodb database replic set uri.
* `SOCKETS_DB`, database name of replic set.
* `COLLECTION`, collection name of replic set.

## Installation
```
git clone -b svchat-with-fs --single-branch https://github.com/santiagocuebas/sveltekit-advanced-chat-app
cd sveltekit-advanced-chat-app
cd backend
pnpm run todo
cd frontend
pnpm run todo
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
