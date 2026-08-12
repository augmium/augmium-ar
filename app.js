AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.viewerSpace = null;
        this.referenceSpace = null;

        this.currentPose = null;
        this.placed = false;

        const scene = this.el.sceneEl;
        const renderer = scene.renderer;

        // Wait until the user enters AR
        scene.addEventListener('enter-vr', async () => {

            console.log('AR session started');

            const session = renderer.xr.getSession();

            try {

                // Create a reference space attached to the phone camera
                this.viewerSpace =
                    await session.requestReferenceSpace('viewer');

                // Ask WebXR to provide hit-test results
                this.hitTestSource =
                    await session.requestHitTestSource({
                        space: this.viewerSpace
                    });

                // Get the reference space used by the A-Frame scene
                this.referenceSpace =
                    renderer.xr.getReferenceSpace();

                console.log('Hit test is ready!');

            } catch (error) {

                console.error('Hit test setup failed:', error);

            }

        });

        // Detect taps on the screen
        scene.canvas.addEventListener('touchend', () => {

            if (!this.currentPose || this.placed) {
                return;
            }

            this.placed = true;

            const reticle =
                document.querySelector('#reticle');

            const cube =
                document.querySelector('#cube');

            // Lock the reticle
            reticle.setAttribute('color', '#FFFFFF');

            // Place the cube at the detected surface
            cube.object3D.position.copy(
                this.currentPose.position
            );

            cube.setAttribute('visible', true);

            console.log('Object placed!');

        });

    },

    tick: function () {

        if (!this.hitTestSource || this.placed) {
            return;
        }

        const renderer = this.el.sceneEl.renderer;

        // Get the current WebXR frame
        const frame = renderer.xr.getFrame();

        if (!frame) {
            return;
        }

        // Get hit-test results
        const hitTestResults =
            frame.getHitTestResults(this.hitTestSource);

        if (hitTestResults.length === 0) {

            this.currentPose = null;

            document
                .querySelector('#reticle')
                .setAttribute('visible', false);

            return;
        }

        // Use the first detected surface
        const hit = hitTestResults[0];

        // Get the position of that surface
        const pose =
            hit.getPose(this.referenceSpace);

        if (!pose) {
            return;
        }

        this.currentPose = pose.transform;

        const reticle =
            document.querySelector('#reticle');

        // Move the reticle to the detected surface
        reticle.object3D.position.set(
            pose.transform.position.x,
            pose.transform.position.y,
            pose.transform.position.z
        );

        reticle.setAttribute('visible', true);

    }

});