(function () {
    class MousePlugin {
        constructor(target) {
            this._pressedButtons = new Set();

            this._onMouseDown = this._onMouseDown.bind(this);
            this._onMouseUp = this._onMouseUp.bind(this);

            if (target) {
                this.attach(target);
            }
        }

        attach(target) {
            this._target = target;
            target.addEventListener("mousedown", this._onMouseDown);
            target.addEventListener("mouseup", this._onMouseUp);
        }

        detach() {
            if (!this._target) return;

            this._target.removeEventListener("mousedown", this._onMouseDown);
            this._target.removeEventListener("mouseup", this._onMouseUp);

            this._pressedButtons.clear();
            this._target = null;
        }


        _onMouseDown(e) {
            this._pressedButtons.add(e.button);
        }

        _onMouseUp(e) {
            this._pressedButtons.delete(e.button);
        }

        isActionActive(actionConfig) {
            if (!actionConfig.buttons) return false;

            return [...actionConfig.buttons]
                .some(button => this._pressedButtons.has(button));
        }
    }

    window.MousePlugin = MousePlugin;
})();