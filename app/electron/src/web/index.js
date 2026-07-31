const func = async () => {
	const versions = await ipc.versions()

	const information = document.getElementById('info')
	information.innerText = `This app is using Chrome (v${versions.chrome}), Node.js (v${versions.node}), and Electron (v${versions.electron})`
}

func()

document.getElementById('ping').addEventListener('click', async () => {
	const response = await ipc.ping('d')

	localStorage.setItem('myCat', 'Tom')

	console.log(response)
})

//window.outerWidth
// window.screenY
