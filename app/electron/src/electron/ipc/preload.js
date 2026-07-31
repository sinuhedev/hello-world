import { contextBridge, ipcRenderer } from 'electron/renderer'

contextBridge.exposeInMainWorld('ipc', {
	versions: () => ipcRenderer.invoke('versions'),
	ping: arg => ipcRenderer.invoke('ping', arg)
})
