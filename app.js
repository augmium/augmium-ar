AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.el.sceneEl.addEventListener('enter-vr', () => {

            const scene = this.el.sceneEl;
            const renderer = scene.renderer;

            if (!renderer.xr) {
                console.error('WebXR is not available.');
                return;
            }

            const session = renderer.xr.getSession();

            console.log('AR session started');
            console.log('Hit-test supported:', session.enabledFeatures);

        });

    }

});