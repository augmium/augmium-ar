AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;
        this.placed = false;

        this.reticle =
            document.querySelector('#reticle');

        const scene = this.el.sceneEl;


        // Start AR
        scene.addEventListener('enter-vr', async () => {

            console.log('AR started');

            const renderer = scene.renderer;
            const session = renderer.xr.getSession();

            try {

                const viewerSpace =
                    await session.requestReferenceSpace('viewer');

                this.hitTestSource =
                    await session.requestHitTestSource({
                        space: viewerSpace
                    });

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


        // Tap to lock
        scene.canvas.addEventListener(
            'touchend',
            () => {

                // Don't do anything if we haven't
                // detected a surface.
                if (!this.reticle.object3D.visible) {
                    return;
                }

                // Lock the reticle.
                this.placed = true;

                console.log('SURFACE LOCKED');

            }
        );

    },


    tick: function () {

        // Once placed, stop updating the reticle.
        if (
            !this.hitTestSource ||
            !this.referenceSpace ||
            this.placed
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


        // No surface detected.
        if (results.length === 0) {

            this.reticle.object3D.visible = false;

            return;

        }


        // Get first surface hit.
        const hit = results[0];

        const pose =
            hit.getPose(
                this.referenceSpace
            );

        if (!pose) {
            return;
        }


        const position =
            pose.transform.position;


        // Move reticle to detected surface.
        this.reticle.object3D.position.set(
            position.x,
            position.y,
            position.z
        );


        // Show reticle.
        this.reticle.object3D.visible = true;

    }

});