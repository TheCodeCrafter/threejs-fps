/**
 * Stats
 */
define(["Stats"], function (Stats) {

    'use strict';

    var stats = new Stats();

    // with stats r16 css is hardcoded - mrdoob whyyyy ;...;
    stats.domElement.style = "position:absolute; left:0; bottom: 0; cursor: pointer; opacity: 0.9; z-index: 10000;";
    // stats.domElement.style.position = 'absolute';
    // stats.domElement.style.bottom = '0';

	// // STATS
	// this.stats = new Stats();
	// this.stats.domElement.style.position	= 'absolute';
	// this.stats.domElement.style.bottom	= '0px';
	// this.stats.domElement.style.zIndex	= 100;
	// container.appendChild( this.stats.domElement );

    document.body.appendChild( stats.domElement );

    return stats;
});