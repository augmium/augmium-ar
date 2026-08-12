AFRAME.registerComponent('surface-placement', {

    init: function () {

        this.hitTestSource = null;
        this.referenceSpace = null;
        this.placed = false;
        this.hasHit = false;

        this.reticle = document.querySelector('#reticle');
        this.cube = document.querySelector('#cube');

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

                console.error('HIT TEST ERROR:', error);

            }

        });


        scene.canvas.addEventListener('touchend', () => {

            if (this.placed) {
                return;
            }

            if (!this.hasHit) {
                console.log('No surface detected yet.');
                return;
            }

            this.placed = true;

            const position =
                this.reticle.object3D.position;

            this.cube.object3D.position.copy(position);

            this.cube.setAttribute('visible', true);

            console.log('OBJECT PLACED');

        });

    },


    tick: function () {

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


        if (results.length === 0) {

            this.hasHit = false;

            this.reticle.setAttribute(
                'visible',
                false
            );

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


        this.hasHit = true;

        this.reticle.setAttribute(
            'visible',
            true
        );

    }

});