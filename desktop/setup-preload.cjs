"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("plsSetup", Object.freeze({
	summary: () => ipcRenderer.invoke("pls-setup-summary"),
	save: (input) => ipcRenderer.invoke("pls-setup-save", input),
}));
