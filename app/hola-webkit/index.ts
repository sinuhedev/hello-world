import { Webview } from "webview-bun";

const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Hola Mundo</title>
  <style>
    body {
      margin: 0;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: white;
    }
    h1 {
      font-size: 3rem;
      margin: 0;
    }
  </style>
</head>
<body>
  <h1>¡Hola Mundo desde Bun + WebKit!</h1>
</body>
</html>
`;

const webview = new Webview(true);
webview.title = "Hola Mundo - Arch Linux";
webview.setHTML(html);
webview.run();
