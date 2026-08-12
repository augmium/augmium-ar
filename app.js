AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;

        this.reticle =
            document.querySelector('#reticle');

        const scene = this.el.sceneEl;

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

            this.reticle.object3D.visible = false;

            return;

        }

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

        this.reticle.object3D.position.set(
            position.x,
            position.y,
            position.z
        );

        this.reticle.object3D.visible = true;

    }

});