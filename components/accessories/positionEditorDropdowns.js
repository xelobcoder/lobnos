/** Keep toolbar menus visible above scrollable result-entry cards and sticky headers. */
export default function positionEditorDropdowns(editor) {
	const cleanups = [];
	for (const dropdown of editor.ui.view.toolbar.items) {
		const panel = dropdown.panelView?.element;
		const button = dropdown.buttonView?.element;
		if (!panel || !button || (!dropdown.element?.classList.contains("ck-heading-dropdown")
			&& dropdown.buttonView.label !== "Insert table")) continue;

		let frame;
		const viewport = window.visualViewport;
		const position = () => {
			const anchor = button.getBoundingClientRect();
			const width = viewport?.width ?? document.documentElement.clientWidth;
			const height = viewport?.height ?? document.documentElement.clientHeight;
			const leftEdge = viewport?.offsetLeft ?? 0;
			const topEdge = viewport?.offsetTop ?? 0;
			const bottomEdge = topEdge + height;
			const gap = 6;
			if (anchor.bottom <= topEdge || anchor.top >= bottomEdge) {
				dropdown.isOpen = false;
				return;
			}

			panel.style.setProperty("--editor-menu-width", `${Math.max(0, width - gap * 2)}px`);
			const below = Math.max(0, bottomEdge - anchor.bottom - gap * 2);
			const above = Math.max(0, anchor.top - topEdge - gap * 2);
			const openBelow = below >= panel.scrollHeight || below >= above;
			panel.style.setProperty("--editor-menu-height", `${openBelow ? below : above}px`);

			const bounds = panel.getBoundingClientRect();
			const left = Math.max(leftEdge + gap, Math.min(anchor.left, leftEdge + width - bounds.width - gap));
			const top = openBelow ? anchor.bottom + gap : anchor.top - bounds.height - gap;
			panel.style.setProperty("--editor-menu-left", `${left}px`);
			panel.style.setProperty("--editor-menu-top", `${Math.max(topEdge + gap, top)}px`);
		};

		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(position);
		};
		const close = () => {
			cancelAnimationFrame(frame);
			window.removeEventListener("scroll", schedule, true);
			window.removeEventListener("resize", schedule);
			viewport?.removeEventListener("resize", schedule);
			viewport?.removeEventListener("scroll", schedule);
			if (typeof panel.hidePopover === "function" && panel.matches(":popover-open")) panel.hidePopover();
			panel.removeAttribute("popover");
			panel.classList.remove("pls-editor-popup");
		};
		const update = (_event, _property, open) => {
			if (!open) {
				close();
				return;
			}
			panel.classList.add("pls-editor-popup");
			if (typeof panel.showPopover === "function") {
				panel.setAttribute("popover", "manual");
				panel.showPopover();
			}
			schedule();
			window.addEventListener("scroll", schedule, true);
			window.addEventListener("resize", schedule);
			viewport?.addEventListener("resize", schedule);
			viewport?.addEventListener("scroll", schedule);
		};
		dropdown.on("change:isOpen", update);
		cleanups.push(() => { dropdown.off("change:isOpen", update); close(); });
	}
	editor.once("destroy", () => cleanups.forEach(cleanup => cleanup()), { priority: "high" });
}
