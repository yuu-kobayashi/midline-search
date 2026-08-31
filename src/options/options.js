// Stored settings (STORAGE_KEYS, breakpoint bounds, clampBreakpoint,
// resolveBreakpoint) come from utils/settings.js, tab definitions (SEARCH_TABS,
// COMMON_TAB_KEY) from utils/search-tabs.js, and applyI18n from
// utils/i18n-helper.js -- this page builds its own markup, so it localizes what it
// builds rather than relying on the helper having run first.
document.addEventListener("DOMContentLoaded", () => {
	const SAVED_FEEDBACK_MS = 2000;

	const tabList = document.getElementById("settings-tabs");
	const panelContainer = document.getElementById("settings-panels");
	const resetModal = document.getElementById("reset-modal");
	const cancelResetButton = document.getElementById("cancel-reset");
	const confirmResetButton = document.getElementById("confirm-reset");

	// The shared panel comes first, then one panel per Google search tab
	const panelDefs = [
		{ key: COMMON_TAB_KEY, i18nKey: "tab_common", isCommon: true },
		...SEARCH_TABS.map(({ key, i18nKey }) => ({ key, i18nKey, isCommon: false })),
	];

	// key -> { def, button, panel, cssEditor, breakpointInput, inheritCheckbox, savedCSS, savedBreakpoint }
	const panels = new Map();
	let activeKey = COMMON_TAB_KEY;
	// Shared breakpoint, mirrored into tab panels that follow it
	let commonBreakpoint = DEFAULT_BREAKPOINT;

	// ---------------------------------------------------------------- markup

	// One labelled row of pills; the wrapper is presentational so the buttons
	// stay the direct tabs of the tablist for assistive technology
	const buildTabGroup = (modifier, labelKey) => {
		const group = document.createElement("div");
		group.className = `tab-group tab-group--${modifier}`;
		group.setAttribute("role", "presentation");
		group.innerHTML = `<span class="tab-group-label" data-i18n="${labelKey}"></span><div class="tab-group-items" role="presentation"></div>`;
		tabList.appendChild(group);
		return group.querySelector(".tab-group-items");
	};

	const buildTabButton = (def) => {
		const button = document.createElement("button");
		button.type = "button";
		button.className = def.isCommon ? "tab-button tab-button--common" : "tab-button";
		button.id = `tab-button-${def.key}`;
		button.setAttribute("role", "tab");
		button.setAttribute("aria-controls", `tab-panel-${def.key}`);
		button.innerHTML = `<span data-i18n="${def.i18nKey}"></span><span class="dirty-dot" aria-hidden="true"></span>`;
		return button;
	};

	const buildPanel = (def) => {
		const panel = document.createElement("section");
		panel.className = "tab-panel";
		panel.id = `tab-panel-${def.key}`;
		panel.setAttribute("role", "tabpanel");
		panel.setAttribute("aria-labelledby", `tab-button-${def.key}`);

		// Tab panels get an extra checkbox for following the shared breakpoint
		const inheritField = def.isCommon
			? ""
			: `<label class="checkbox-label">
					<input type="checkbox" class="inherit-breakpoint" id="inherit-breakpoint-${def.key}" />
					<span data-i18n="use_common_breakpoint"></span>
				</label>`;

		panel.innerHTML = `
			<div class="form-group">
				<h2 data-i18n="screen_width_settings"></h2>
				${inheritField}
				<label for="breakpoint-input-${def.key}" data-i18n="media_query_start"></label>
				<div class="input-group">
					<input type="number" class="breakpoint-input" id="breakpoint-input-${def.key}" min="${MIN_BREAKPOINT}" max="${MAX_BREAKPOINT}" value="${DEFAULT_BREAKPOINT}" />
					<button type="button" class="primary-button save-breakpoint" data-i18n="save"></button>
				</div>
				<p class="help-text" data-i18n="${def.isCommon ? "screen_width_help" : "tab_screen_width_help"}"></p>
			</div>

			<div class="form-group">
				<h2 data-i18n="additional_style_settings"></h2>
				<label for="css-editor-${def.key}" data-i18n="custom_css"></label>
				<textarea class="css-editor" id="css-editor-${def.key}" spellcheck="false"></textarea>
				<p class="help-text" data-i18n="${def.isCommon ? "common_css_help" : "tab_css_help"}"></p>
				<div class="button-group">
					<button type="button" class="reset-button" data-i18n="discard_changes"></button>
					<button type="button" class="primary-button save-button" data-i18n="save"></button>
				</div>
			</div>
		`;
		return panel;
	};

	// ------------------------------------------------------------ dirty state

	// Breakpoint currently entered; null on a tab panel that follows the shared value.
	// An empty or out-of-range field resolves to the value that would actually be stored.
	const readBreakpoint = (entry) => {
		if (entry.inheritCheckbox?.checked) return null;
		const value = parseInt(entry.breakpointInput.value, 10);
		return clampBreakpoint(Number.isNaN(value) ? DEFAULT_BREAKPOINT : value);
	};

	const isDirty = (entry) => entry.cssEditor.value !== entry.savedCSS || readBreakpoint(entry) !== entry.savedBreakpoint;

	const refreshDirtyState = (entry) => {
		entry.button.classList.toggle("is-dirty", isDirty(entry));
	};

	// ----------------------------------------------------------- persistence

	const showSaved = (button) => {
		clearTimeout(Number(button.dataset.savedTimer));
		if (!button.dataset.originalText) {
			button.dataset.originalText = button.textContent;
		}
		button.textContent = chrome.i18n.getMessage("save_completed");
		button.classList.add("is-saved");
		button.dataset.savedTimer = String(
			setTimeout(() => {
				button.textContent = button.dataset.originalText;
				button.classList.remove("is-saved");
			}, SAVED_FEEDBACK_MS)
		);
	};

	// Store one tab's value inside the map held under storageKey. A null value means
	// the tab has nothing of its own, so its entry is dropped rather than left empty
	// -- the content script reads a missing entry as "follow the shared setting".
	const saveTabValue = (storageKey, tabKey, value, done) => {
		chrome.storage.local.get([storageKey], (result) => {
			const stored = { ...(result[storageKey] ?? {}) };
			if (value === null) {
				delete stored[tabKey];
			} else {
				stored[tabKey] = value;
			}
			chrome.storage.local.set({ [storageKey]: stored }, done);
		});
	};

	// Show the shared breakpoint in every tab panel that follows it
	const syncInheritedBreakpoints = () => {
		panels.forEach((entry) => {
			if (entry.def.isCommon || entry.savedBreakpoint !== null) return;
			entry.breakpointInput.value = commonBreakpoint;
			refreshDirtyState(entry);
		});
	};

	const saveBreakpoint = (entry, button) => {
		const breakpoint = readBreakpoint(entry);
		// Show what actually gets stored, in case the entered value was empty or clamped
		entry.breakpointInput.value = breakpoint ?? commonBreakpoint;

		const done = () => {
			entry.savedBreakpoint = breakpoint;
			refreshDirtyState(entry);
			showSaved(button);
		};

		if (entry.def.isCommon) {
			chrome.storage.local.set({ [STORAGE_KEYS.breakpoint]: breakpoint }, () => {
				commonBreakpoint = breakpoint;
				syncInheritedBreakpoints();
				done();
			});
			return;
		}

		saveTabValue(STORAGE_KEYS.tabBreakpoints, entry.def.key, breakpoint, done);
	};

	const saveCSS = (entry, button) => {
		const css = entry.cssEditor.value;

		const done = () => {
			entry.savedCSS = css;
			refreshDirtyState(entry);
			showSaved(button);
		};

		if (entry.def.isCommon) {
			chrome.storage.local.set({ [STORAGE_KEYS.customCSS]: css }, done);
			return;
		}

		saveTabValue(STORAGE_KEYS.tabCustomCSS, entry.def.key, css.trim() === "" ? null : css, done);
	};

	// --------------------------------------------------------------- tab bar

	const setActiveTab = (key) => {
		activeKey = key;
		panels.forEach((entry, entryKey) => {
			const isActive = entryKey === key;
			entry.button.classList.toggle("is-active", isActive);
			entry.button.setAttribute("aria-selected", String(isActive));
			entry.button.tabIndex = isActive ? 0 : -1;
			entry.panel.hidden = !isActive;
		});
	};

	const moveActiveTab = (offset) => {
		const keys = [...panels.keys()];
		const nextKey = keys[(keys.indexOf(activeKey) + offset + keys.length) % keys.length];
		setActiveTab(nextKey);
		panels.get(nextKey).button.focus();
	};

	// ------------------------------------------------------------ reset modal

	const openResetModal = () => resetModal.classList.add("is-open");
	const closeResetModal = () => resetModal.classList.remove("is-open");

	cancelResetButton.addEventListener("click", closeResetModal);

	// Discard the unsaved CSS edits of the panel currently open
	confirmResetButton.addEventListener("click", () => {
		const entry = panels.get(activeKey);
		entry.cssEditor.value = entry.savedCSS;
		refreshDirtyState(entry);
		closeResetModal();
	});

	// Close modal when clicking outside
	resetModal.addEventListener("click", (event) => {
		if (event.target === resetModal) {
			closeResetModal();
		}
	});

	// ------------------------------------------------------------------ build

	const commonSlot = buildTabGroup("common", "common_layer_label");
	const perTabSlot = buildTabGroup("tabs", "per_tab_layer_label");

	panelDefs.forEach((def) => {
		const button = buildTabButton(def);
		const panel = buildPanel(def);
		(def.isCommon ? commonSlot : perTabSlot).appendChild(button);
		panelContainer.appendChild(panel);

		const entry = {
			def,
			button,
			panel,
			cssEditor: panel.querySelector(".css-editor"),
			breakpointInput: panel.querySelector(".breakpoint-input"),
			inheritCheckbox: panel.querySelector(".inherit-breakpoint"),
			savedCSS: "",
			savedBreakpoint: def.isCommon ? DEFAULT_BREAKPOINT : null,
		};
		panels.set(def.key, entry);

		const saveBreakpointButton = panel.querySelector(".save-breakpoint");

		button.addEventListener("click", () => setActiveTab(def.key));
		entry.cssEditor.addEventListener("input", () => refreshDirtyState(entry));
		entry.breakpointInput.addEventListener("input", () => refreshDirtyState(entry));
		entry.inheritCheckbox?.addEventListener("change", () => {
			entry.breakpointInput.disabled = entry.inheritCheckbox.checked;
			if (entry.inheritCheckbox.checked) {
				entry.breakpointInput.value = commonBreakpoint;
				// Ticking the box disables the field, so there is nothing left to edit
				// before saving -- drop this tab's own breakpoint straight away
				saveBreakpoint(entry, saveBreakpointButton);
				return;
			}
			refreshDirtyState(entry);
		});
		saveBreakpointButton.addEventListener("click", (event) => saveBreakpoint(entry, event.currentTarget));
		panel.querySelector(".save-button").addEventListener("click", (event) => saveCSS(entry, event.currentTarget));
		panel.querySelector(".reset-button").addEventListener("click", openResetModal);
	});

	// Everything above was created after the page loaded, so it still holds the
	// data-i18n placeholders rather than text
	applyI18n(tabList);
	applyI18n(panelContainer);

	// The group labels carry the meaning visually, so the switcher only needs a
	// name for assistive technology
	tabList.setAttribute("aria-label", chrome.i18n.getMessage("target_tab"));
	setActiveTab(COMMON_TAB_KEY);

	tabList.addEventListener("keydown", (event) => {
		if (event.key === "ArrowRight") moveActiveTab(1);
		else if (event.key === "ArrowLeft") moveActiveTab(-1);
		else return;
		event.preventDefault();
	});

	// ------------------------------------------------------------- load state

	chrome.storage.local.get(
		[STORAGE_KEYS.customCSS, STORAGE_KEYS.breakpoint, STORAGE_KEYS.tabCustomCSS, STORAGE_KEYS.tabBreakpoints],
		(result) => {
			const tabCustomCSS = result[STORAGE_KEYS.tabCustomCSS] ?? {};
			const tabBreakpoints = result[STORAGE_KEYS.tabBreakpoints] ?? {};
			commonBreakpoint = resolveBreakpoint(result[STORAGE_KEYS.breakpoint]);

			panels.forEach((entry, key) => {
				if (entry.def.isCommon) {
					entry.savedCSS = result[STORAGE_KEYS.customCSS] ?? "";
					entry.savedBreakpoint = commonBreakpoint;
					entry.breakpointInput.value = commonBreakpoint;
				} else {
					// null means this tab follows the shared breakpoint
					entry.savedCSS = tabCustomCSS[key] ?? "";
					entry.savedBreakpoint = resolveBreakpoint(tabBreakpoints[key], null);
					entry.inheritCheckbox.checked = entry.savedBreakpoint === null;
					entry.breakpointInput.disabled = entry.savedBreakpoint === null;
					entry.breakpointInput.value = entry.savedBreakpoint ?? commonBreakpoint;
				}
				entry.cssEditor.value = entry.savedCSS;
				refreshDirtyState(entry);
			});
		}
	);
});
