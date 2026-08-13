AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;

        this.reticle =
            document.querySelector('#reticle');

        this.placed = false;

        const scene = this.el.sceneEl;


        // -------------------------
        // START AR
        // -------------------------

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


        // -------------------------
        // TAP TO LOCK
        // -------------------------

        scene.canvas.addEventListener(
            'touchend',
            () => {

                if (!this.reticle.object3D.visible) {
                    return;
                }

                this.placed = true;

                console.log('SURFACE LOCKED');

            }
        );

    },


    // -------------------------
    // HIT TEST LOOP
    // -------------------------

    tick: function () {

        // Stop updating once placed
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


        // No surface detected
        if (results.length === 0) {

            this.reticle.object3D.visible = false;

            return;

        }


        // First detected surface
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


        // Move reticle
        this.reticle.object3D.position.set(
            position.x,
            position.y,
            position.z
        );


        // Show reticle
        this.reticle.object3D.visible = true;

    }

});