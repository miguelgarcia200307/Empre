# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Supabase Edge Functions

### delete-account

Esta función elimina permanentemente la cuenta del usuario autenticado y todos sus datos asociados (por CASCADE en la base de datos).

#### Despliegue

1. Instalar Supabase CLI si no lo tienes:
```bash
npm install -g supabase
```

2. Iniciar sesión en Supabase:
```bash
supabase login
```

3. Linkear el proyecto (reemplaza `<project-ref>` con el ID de tu proyecto):
```bash
supabase link --project-ref <project-ref>
```

4. Desplegar la función:
```bash
supabase functions deploy delete-account
```

5. Las variables de entorno `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` se configuran automáticamente en el entorno de Supabase Edge Functions.

#### Seguridad

- La función valida el JWT del usuario antes de proceder.
- Solo puede eliminar la cuenta del usuario autenticado (no acepta userId desde el body).
- Requiere `SUPABASE_SERVICE_ROLE_KEY` para ejecutar `auth.admin.deleteUser()`.

---

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
