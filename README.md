# SvChat
SvChat es una aplicación web, vagamente basada en WhatsApp, con las que puedes enviar mensajes, imagenes, audios, videos y crear grupos.
![image](/docs/screenshot1.png)
![image](/docs/screenshot2.png)

## Variables de Ambiente
### Cliente
* `PUBLIC_DIR`, la dirección http del servidor.
* `PUBLIC_GITHUB_ID`, el id del cliente github oauth.
### Servidor
* `PORT`, el puerto del servidor.
* `SECRET`, la clave JWT secreta.
* `ORIGIN`, la dirección http del cliente.
* `GITHUB_ID`, el id del cliente github oauth.
* `GITHUB_SECRET`, la clave secreta del cliente github oauth.
* `MONGO_URI`, el URI de la base de datos de mongodb.

## Instalación Manual
```
git clone -b svchat-with-fs --single-branch https://github.com/santiagocuebas/sveltekit-advanced-chat-app
cd sveltekit-advanced-chat-app
cd backend
pnpm run todo
cd frontend
pnpm run todo
```

## Recursos
* Node.js
* Express
* MongoDB
* Typescript
* Socket.io
* SvelteKit
* Tailwind.css

## Mejoras a Futuro
- [ ] Actualizar sintaxis a Svelte 5.
- [ ] Actualizar Responsive Design.
