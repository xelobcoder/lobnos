"use strict";
const form = document.getElementById("setup");
const status = document.getElementById("status");
const button = document.getElementById("save");
window.plsSetup.summary().then(result => {
	if (!result.automatic) {
		document.getElementById("description").textContent = "An existing database configuration is in use and remains compatible. Automatic provisioning cannot replace an existing installation. Ask an administrator to restore its original configuration if repair is needed.";
		for (const element of form.elements) element.disabled = true;
		return;
	}
	for (const [field, value] of Object.entries(result.fields)) {
		const element = form.elements.namedItem(field);
		if (element) element.value = value;
	}
	button.disabled = false;
}).catch(() => { status.textContent = "Local setup is unavailable. Restart the application."; });
form.addEventListener("submit", async event => {
	event.preventDefault();
	button.disabled = true;
	status.textContent = "Authorizing and provisioning local databases. This can take several minutes...";
	try {
		const result = await window.plsSetup.save(Object.fromEntries(new FormData(form)));
		status.textContent = result.message;
		form.elements.namedItem("password").value = "";
	} catch {
		status.textContent = "Local setup failed. Restart and try again.";
	} finally {
		form.elements.namedItem("password").value = "";
		form.elements.namedItem("installationPassword").value = "";
		button.disabled = false;
	}
});
