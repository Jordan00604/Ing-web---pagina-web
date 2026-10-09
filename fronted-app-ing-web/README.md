# Frontend Fashion World

Guía completa de arranque, endpoints, seguridad, pruebas y pendientes: [`../README.md`](../README.md).

```powershell
bun run dev --host 127.0.0.1 --port 5173 --strictPort
bun run test
bun run lint
bun run build
```

El backend debe escuchar en `http://localhost:8081`; la sesión se mantiene solo en memoria, el carrito local guarda IDs/cantidades sin credenciales. Implementación JSX/CSS, sin Tailwind/router/dependencias HTTP nuevas. Matriz de diseño: [`../docs/STITCH_IMPLEMENTACION.md`](../docs/STITCH_IMPLEMENTACION.md).

## Documentación de la plantilla original (historial conservado)

### React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
