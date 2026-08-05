(function () {
    const player = document.getElementById('player');
    let positionX = 200;
    const speed = 5;

    const controller = new InputController({
        left: {
            keys: [37, 65],
            enabled: true
        },
        right: {
            keys: [39, 68],
            enabled: true
        },
        shoot: {
            buttons: [0],
            enabled: true
        }
    }, document);

    const keyboardPlugin = new KeyboardPlugin();
    controller.addPlugin(keyboardPlugin);

    const mousePlugin = new MousePlugin();
    controller.addPlugin(mousePlugin);

    function updateStatus() {
        document.getElementById('enabledStatus').textContent = controller.enabled;
        document.getElementById('focusedStatus').textContent = controller.focused;
    }

    function gameLoop() {
        if (controller.isActionActive('left')) {
            positionX -= speed;
        }
        if (controller.isActionActive('right')) {
            positionX += speed;
        }

        if (controller.isActionActive('shoot')) {
            player.style.backgroundColor = 'red';
        } else {
            player.style.backgroundColor = 'blue';
        }

        player.style.left = positionX + 'px';

        if (controller.isActionActive('jump')) {
            player.style.backgroundColor = 'pink';
        }
        requestAnimationFrame(gameLoop);
    }

    document.getElementById('attachBtn').addEventListener('click', function () {
        controller.attach(document);
        updateStatus();
    });

    document.getElementById('detachBtn').addEventListener('click', function () {
        controller.detach(document);
        updateStatus();
    });

    document.getElementById('enableBtn').addEventListener('click', function () {
        controller.enabled = true;
        updateStatus();
    });

    document.getElementById('disableBtn').addEventListener('click', function () {
        controller.enabled = false;
        updateStatus();
    });

    document.getElementById('bindJumpBtn').addEventListener('click', function () {
        controller.bindActions({
            jump: {
                keys: [32],
                enabled: true
            }
        });
    });

    window.addEventListener('focus', updateStatus);

    window.addEventListener('blur', updateStatus);
    updateStatus();

    requestAnimationFrame(gameLoop);

})();