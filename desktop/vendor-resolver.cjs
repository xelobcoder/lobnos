"use strict";

const Module = require("node:module");
const path = require("node:path");

const vendorPath = process.env.PLS_VENDOR_PATH;
if (!vendorPath) {
	throw new Error("PLS_VENDOR_PATH is required for packaged service resolution.");
}

const originalResolveFilename = Module._resolveFilename;
Module._resolveFilename = function resolveFromPackagedVendor(
	request,
	parent,
	isMain,
	options,
) {
	if (
		typeof request === "string" &&
		!request.startsWith(".") &&
		!path.isAbsolute(request) &&
		!Module.isBuiltin(request)
	) {
		try {
			return originalResolveFilename.call(
				this,
				path.join(vendorPath, request),
				parent,
				isMain,
				options,
			);
		} catch (error) {
			if (!error || error.code !== "MODULE_NOT_FOUND") {
				throw error;
			}
		}
	}

	return originalResolveFilename.call(this, request, parent, isMain, options);
};
