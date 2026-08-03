(function () {
    class InputController {
        static ACTION_ACTIVATED = 'input-controller:action-activated';
        static ACTION_DEACTIVATED = 'input-controller:action-deactivated';

        constructor(actionsToBind, target) {
            this._actions = new Map();
            this._keyMap = new Map();
            this._pressedKeys = new Set();
            this._target = null;
            this._enabled = false;
            this._focused = false;

            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);
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
                const keys = config.keys || [];
                const enabled = config.enabled !== undefined ? config.enabled : true;

                let actionEntry = this._actions.get(actionName);
                if (!actionEntry) {
                    actionEntry = { keys: new Set(), enabled };
                    this._actions.set(actionName, actionEntry);
                } else {
                    actionEntry.enabled = enabled;
                }

                for (const key of actionEntry.keys) {
                    this._keyMap.delete(key);
                }
                actionEntry.keys.clear();

                for (const key of keys) {
                    if (this._keyMap.has(key)) {
                        const oldAction = this._keyMap.get(key);
                        const oldEntry = this._actions.get(oldAction);
                        if (oldEntry) {
                            oldEntry.keys.delete(key);
                        }
                    }
                    this._keyMap.set(key, actionName);
                    actionEntry.keys.add(key);
                }
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
                if (this._isActionActiveInternal(actionName)) {
                    this._deactivateAction(actionName);
                }
            }
        }

        attach(target, dontEnable) {
            if (this._target) {
                this.detach();
            }
            this._target = target;
            this._focused = document.hasFocus();
            target.addEventListener('keydown', this._onKeyDown);
            target.addEventListener('keyup', this._onKeyUp);
            window.addEventListener('blur', this._onWindowBlur);
            window.addEventListener('focus', this._onWindowFocus);
            if (!dontEnable) {
                this._enabled = true;
            }
        }

        detach() {
            if (this._target) {
                this._target.removeEventListener('keydown', this._onKeyDown);
                this._target.removeEventListener('keyup', this._onKeyUp);
                window.removeEventListener('blur', this._onWindowBlur);
                window.removeEventListener('focus', this._onWindowFocus);
                this._target = null;
            }
            this._enabled = false;
            this._focused = false;
            this._pressedKeys.clear();
        }

        isActionActive(action) {
            if (!this._enabled || !this._focused) return false;
            const entry = this._actions.get(action);
            if (!entry || !entry.enabled) return false;
            return
            this._isActionActiveInternal(action);

        }

        isKeyPressed(keyCode) {
            return
            this._pressedKeys.has(keyCode);
        }

        _isActionActiveInternal(actionName) {
            const entry = this._actions.get(actionName);
            if (!entry) return false;
            for (const key of entry.keys) {
                if (this._pressedKeys.has(key)) return true;
            }
            return false;
        }

        _onKeyDown(event) {
            if (!this._enabled || !this._focused) return;
            const keyCode = event.keyCode;
            if (this._pressedKeys.has(keyCode)) return;
            this._pressedKeys.add(keyCode);

            if (this._keyMap.has(keyCode)) {
                event.preventDefault();
                const actionName = this._keyMap.get(keyCode);
                const entry = this._actions.get(actionName);
                if (entry && entry.enabled) {
                    if (!this._isActionActiveInternal(actionName)) {
                        this._dispatch(InputController.ACTION_ACTIVATED, actionName);
                    }
                }
            }
        }

        _onKeyUp(event) {
            if (!this._enabled || !this._focused) return;
            const keyCode = event.keyCode;
            if (!this._pressedKeys.has(keyCode)) return;
            this._pressedKeys.delete(keyCode);

            if (this._keyMap.has(keyCode)) {
                event.preventDefault();
                const actionName = this._keyMap.get(keyCode);
                const entry = this._actions.get(actionName);
                if (entry && entry.enabled) {
                    if (!this._isActionActiveInternal(actionName)) {
                        this._dispatch(InputController.ACTION_DEACTIVATED, actionName);
                    }
                }
            }
        }

        _onWindowBlur() {
            this._focused = false;
            this._resetAllActions();
            this._pressedKeys.clear();
        }

        _onWindowFocus() {
            this._focused = true;
        }

        _resetAllActions() {
            if (!this._target) return;
            for (const [actionName, entry] of this._actions.entries()) {
                if (entry.enabled && this._isActionActiveInternal(actionName)) {
                    this._dispatch(InputController.ACTION_DEACTIVATED, actionName);
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
