AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;
        this.reticle = document.querySelector('#reticle');

        const scene = this.el.sceneEl;

        scene.addEventListener('enter-vr', async () => {

            console.log('AR started');

            const renderer = scene.renderer;
            const session = renderer.xr.getSession();

            try {

                // Reference space attached to the phone/camera
                const viewerSpace =
                    await session.requestReferenceSpace('viewer');

                // Ask WebXR for hit-test information
                this.hitTestSource =
                    await session.requestHitTestSource({
                        space: viewerSpace
                    });

                // Reference space used by our A-Frame scene
                this.referenceSpace =
                    renderer.xr.getReferenceSpace();

                console.log('HIT TEST READY');

            } catch (error) {

                console.error(
                    'HIT TEST ERROR:',
                    error
                );

            }

        });

    },


    tick: function () {

        if (
            !this.hitTestSource ||
            !this.referenceSpace
        ) {
            return;
        }

        const renderer =
            this.el.sceneEl.renderer;

        const frame =
            renderer.xr.getFrame();

        if (!frame) {
            return;
        }

        const results =
            frame.getHitTestResults(
                this.hitTestSource
            );

        if (results.length === 0) {

            this.reticle.setAttribute(
                'visible',
                false
            );

            return;

        }

        const hit =
            results[0];

        const pose =
            hit.getPose(
                this.referenceSpace
            );

        if (!pose) {
            return;
        }

        const position =
            pose.transform.position;

        const reticle =
            this.reticle.object3D;

        reticle.position.set(
            position.x,
            position.y,
            position.z
        );

        reticle.visible = true;

    }

});