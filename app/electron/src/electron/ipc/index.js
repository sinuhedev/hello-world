export default (ipcMain, app, win) => {
	ipcMain.handle('versions', () => process.versions)
	ipcMain.handle('ping', async (evt, arg) => {
		return 'pong: ' + arg
	})
}
