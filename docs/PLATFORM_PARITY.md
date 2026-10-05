# Parity with `hospixo-frontend`

`hospixo_client` is aligned to the same **`src/` folder structure** as `hospixo-frontend` (admin control plane, MUI).

- All directories from `hospixo-frontend/src` are present in `hospixo_client/src`.
- Tenant-only additions (`(public)`, `(workspace)`, platform login, workspace shell) have been **removed**.
- Run `pnpm dev` (port from `package.json`) — login is **`app/(auth)/login`**, admin shell is **`app/(control-plane)/`**.

To compare trees locally:

```bash
diff <(find hospixo-frontend/src -type d | sed 's|.*/src||' | sort) \
     <(find hospixo_client/src -type d | sed 's|.*/src||' | sort)
```
