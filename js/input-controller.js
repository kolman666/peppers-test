(function () {
    class InputController {
        static ACTION_ACTIVATED = 'input-controller:action-activated';
        static ACTION_DEACTIVATED = 'input-controller:action-deactivated';

        constructor(actionsToBind, target) {
            this._actions = new Map();
            this._plugins = [];
            this._target = null;
            this._enabled = false;
            this._focused = false;
            this._actionsState = new Map();
            this._update = this._update.bind(this);

            this._onWindowBlur = this._onWindowBlur.bind(this);
            this._onWindowFocus = this._onWindowFocus.bind(this);

            if (actionsToBind) {
                this.bindActions(actionsToBind);
            }
            if (target) {
                this.attach(target);
            }
        }

        get enabled() {
            return this._enabled;
        }
        set enabled(value) {
            if (value === this._enabled) return;
            this._enabled = value;
            if (!value) {
                this._resetAllActions();
            }
        }

        get focused() {
            return this._focused;
        }

        bindActions(actionsToBind) {
            for (const [actionName, config] of Object.entries(actionsToBind)) {
                this._actions.set(actionName, {
                    ...config,
                    keys: new Set(config.keys || []),
                    buttons: new Set(config.buttons || []),
                    enabled: config.enabled !== false
                });
                this._actionsState.set(actionName, false);
            }
        }

        addPlugin(plugin) {
            this._plugins.push(plugin);

            if (this._target && plugin.attach) {
                plugin.attach(this._target);
            }
        }

        enableAction(actionName) {
            const entry = this._actions.get(actionName);
            if (entry) {
                entry.enabled = true;
            }
        }

        disableAction(actionName) {
            const entry = this._actions.get(actionName);
            if (entry && entry.enabled) {
                entry.enabled = false;
                if (this.isActionActive(actionName)) {
                    this._deactivateAction(actionName);
                }
            }
        }

        attach(target, dontEnable) {
            if (this._target) {
                this.detach();
            }
            this._target = target;

            for (const plugin of this._plugins) {
                if (plugin.attach) {
                    plugin.attach(target);
                }
            }

            this._focused = document.hasFocus();
            window.addEventListener('blur', this._onWindowBlur);
            window.addEventListener('focus', this._onWindowFocus);
            if (!dontEnable) {
                this._enabled = true;
            }

            this._interval = setInterval(this._update, 16);
        }

        detach() {

            if (this._interval) {
                clearInterval(this._interval);
                this._interval = null;
            }

            if (this._target) {
                window.removeEventListener('blur', this._onWindowBlur);
                window.removeEventListener('focus', this._onWindowFocus);

                for (const plugin of this._plugins) {
                    if (plugin.detach) {
                        plugin.detach();
                    }
                }

                this._target = null;
            }
            this._enabled = false;
            this._focused = false;


        }

        isActionActive(action) {
            if (!this._enabled || !this._focused) return false;
            const entry = this._actions.get(action);
            if (!entry || !entry.enabled) return false;
            for (const plugin of this._plugins) {
                if (plugin.isActionActive(entry)) {
                    return true;
                }
            }
            return false;

        }

        isKeyPressed(keyCode) {
            for (const plugin of this._plugins) {
                if (plugin.isKeyPressed && plugin.isKeyPressed(keyCode)) {
                    return true;
                }
            }

            return false;
        }

        _update() {
            if (!this._enabled) return;

            for (const [actionName] of this._actions) {
                const active = this.isActionActive(actionName);
                const old = this._actionsState.get(actionName);

                if (active !== old) {
                    this._actionsState.set(
                        actionName,
                        active
                    );

                    this._dispatch(
                        active ? InputController.ACTION_ACTIVATED : InputController.ACTION_DEACTIVATED, actionName
                    );
                }
            }
        }

        _onWindowBlur() {
            this._focused = false;
            this._resetAllActions();
        }

        _onWindowFocus() {
            this._focused = true;
        }

        _resetAllActions() {
            for (const [actionName] of this._actions) {
                if (this._actionsState.get(actionName)) {
                    this._actionsState.set(
                        actionName,
                        false
                    );

                    this._dispatch(
                        InputController.ACTION_DEACTIVATED,
                        actionName
                    );
                }
            }
        }

        _deactivateAction(actionName) {
            if (!this._target) return;
            this._dispatch(InputController.ACTION_DEACTIVATED, actionName);
        }

        _dispatch(type, actionName) {
            if (!this._target) return;
            const event = new CustomEvent(type, {
                detail: {
                    action: actionName
                },
                bubbles: true,
                cancelable: true
            });

            this._target.dispatchEvent(event);
        }

    }

    window.InputController = InputController;
})();
