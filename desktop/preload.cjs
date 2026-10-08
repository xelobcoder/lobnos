"use strict";

const { contextBridge } = require("electron");

contextBridge.exposeInMainWorld("plsDesktop", Object.freeze({
	isDesktop: true,
	platform: process.platform,
}));
