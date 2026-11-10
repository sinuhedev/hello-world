import index from "./index.html";

Bun.serve({
	port: 3000,
	routes: {
		"/*": index, // cualquier ruta devuelve la SPA
	},
});

console.log("Abre http://localhost:3000");
