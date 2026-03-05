## Setup

Please download the required files by following these steps:

```
curl -L -O https://raw.githubusercontent.com/uraitakahito/hello-javascript/refs/heads/main/Dockerfile
curl -L -O https://raw.githubusercontent.com/uraitakahito/hello-javascript/refs/heads/main/docker-entrypoint.sh
chmod 755 docker-entrypoint.sh
```

Detailed environment setup instructions are described at the beginning of the `Dockerfile`.

## Run

```console
% npm run build
% docker run -d --init --rm -p 8081:80 --mount type=bind,src=`pwd`,dst=/usr/share/nginx/html --name nginx-container nginx
```

Go to http://localhost:8081/ and you should see the app running. When you change assets during development, it is recommended to perform a hard refresh [(⌘ + ⇧ + r)](https://support.google.com/chrome/answer/157179) instead of a regular browser reload.

## Debugging with Chrome DevTools

This project generates source maps (`sourcemap: true` in `rollup.config.ts`), so you can step through the original TypeScript source in Chrome DevTools.

1. Open http://localhost:8081/ in Google Chrome
2. Open DevTools with **F12** (or **⌘ + Option + I** on Mac)
3. Go to the **Sources** tab
4. In the left pane file tree, locate the original `.ts` files mapped via source maps
5. Click a line number to set a **breakpoint**
6. Reload the page (**⌘ + R** / **Ctrl + R**) — execution will pause at the breakpoint

### Step execution shortcuts

| Action | Shortcut |
|---|---|
| Resume | F8 |
| Step over (next line) | F10 |
| Step into (enter function) | F11 |
| Step out (exit function) | Shift + F11 |
