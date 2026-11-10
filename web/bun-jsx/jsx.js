export function h(tag, props, ...children) {
	if (typeof tag === "function") return tag({ ...props, children });

	const el = document.createElement(tag);
	for (const [k, v] of Object.entries(props ?? {})) {
		if (k.startsWith("on")) el.addEventListener(k.slice(2).toLowerCase(), v);
		else el.setAttribute(k, v);
	}
	append(el, children);
	return el;
}

function append(parent, children) {
	for (const c of children.flat(Infinity)) {
		if (c == null || c === false) continue;
		parent.append(c instanceof Node ? c : document.createTextNode(c));
	}
}

export const Fragment = (props) => {
	const frag = document.createDocumentFragment();
	append(frag, props.children);
	return frag;
};

globalThis.h = h;
globalThis.Fragment = Fragment;
