import "./jsx.js";

let count = 0;

const Home = () => (
	<>
		<h1>Hello, World!</h1>
		<button
			type="button"
			onClick={() => {
				count++;
				render();
			}}
		>
			Clicks: {count}
		</button>
	</>
);

const About = () => <h1>Acerca de</h1>;
const NotFound = () => <h1>404</h1>;

const routes = { "/": Home, "/about": About };

function App() {
	const path = location.hash.slice(1) || "/";
	const Page = routes[path] ?? NotFound;

	return (
		<>
			<nav>
				<a href="#/">Inicio</a> | <a href="#/about">Acerca</a>
			</nav>
			<Page />
		</>
	);
}

function render() {
	document.getElementById("root").replaceChildren(<App />);
}

window.addEventListener("hashchange", render);
render();
