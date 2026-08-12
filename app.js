AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;

        this.reticle = document.querySelector('#reticle');
        this.cube = document.querySelector('#cube');

        this.placed = false;

        const scene = this.el.sceneEl;

        // Start AR
        scene.addEventListener('enter-vr', async () => {

            console.log('AR started');

            const renderer = scene.renderer;
            const session = renderer.xr.getSession();

            try {

                // Reference space attached to the phone
                const viewerSpace =
                    await session.requestReferenceSpace('viewer');

                // Create hit-test source
                this.hitTestSource =
                    await session.requestHitTestSource({
                        space: viewerSpace
                    });

                // Reference space used by the scene
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


        // Tap anywhere on the screen
        scene.canvas.addEventListener(
            'touchend',
            () => {

                // Don't allow another placement
                if (this.placed) {
                    return;
                }

                // Don't place if no surface is detected
                if (!this.reticle.object3D.visible) {
                    return;
                }

                // Lock the placement
                this.placed = true;

                // Save reticle position
                const position =
                    this.reticle.object3D.position;

                this.cube.object3D.position.copy(
                    position
                );

                // Show cube
                this.cube.object3D.visible = true;

                console.log('OBJECT PLACED');

            }
        );

    },


    tick: function () {

        // Stop updating after placement
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


        // Get its position
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