(function () {
    class KeyboardPlugin {
        constructor(target) {
            this._pressedKeys = new Set();
            this._onKeyDown = this._onKeyDown.bind(this);
            this._onKeyUp = this._onKeyUp.bind(this);

            if (target) {
                this.attach(target);
            }
        }


        attach(target) {
            this._target = target;
            target.addEventListener("keydown", this._onKeyDown);
            target.addEventListener("keyup", this._onKeyUp);
        }

        detach() {
            if (!this._target) return;

            this._target.removeEventListener("keydown", this._onKeyDown);
            this._target.removeEventListener("keyup", this._onKeyUp);

            this._pressedKeys.clear();
            this._target = null;
        }

        _onKeyDown(e) {
            this._pressedKeys.add(e.keyCode);
            if (this._target) {
                this._target.dispatchEvent(new CustomEvent('plugin:keyboard-change', {
                    bubbles: true
                }));
            }
        }

        _onKeyUp(e) {
            this._pressedKeys.delete(e.keyCode);
            if (this._target) {
                this._target.dispatchEvent(new CustomEvent('plugin:keyboard-change', {
                    bubbles: true
                }));
            }
        }

        isActionActive(actionConfig) {
            if (!actionConfig.keys) return false;
            return [...actionConfig.keys]
                .some(key => this._pressedKeys.has(key));
        }
    }
    window.KeyboardPlugin = KeyboardPlugin;
})();