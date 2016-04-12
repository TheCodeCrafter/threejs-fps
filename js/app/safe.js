/**
 * Setup the control method
 */

define([
       "three",
        "../libs/state-machine.min",
        "TWEEN",
        "scene",
        "debugGUI",
        "physics",
        "listener"
       ], function ( THREE, StateMachine, TWEEN, scene, debugGUI, physics, listener ) {

	var sound1 = new THREE.PositionalAudio( listener );
	sound1.load( 'assets/sounds/safe_door.ogg' );
	sound1.setRefDistance( 8 );
	sound1.setVolume( 0.1 );

	var sound2 = new THREE.PositionalAudio( listener );
	sound2.load( 'assets/sounds/door.ogg' );
	sound2.setRefDistance( 8 );
	sound2.setVolume( 0.1 );

	var sound3 = new THREE.PositionalAudio( listener );
	sound3.load( 'assets/sounds/quietsch2.ogg' );
	sound3.setRefDistance( 8 );
	sound3.setVolume( 0.1 );

	// analyser1 = new THREE.AudioAnalyser( sound1, 32 );

    // DEBUG GUI
    var dg = debugGUI;

    var name = "Safe";
    if ( dg.__folders[ name ] ) {
        var folder = dg.__folders[ name ];
    } else {
        var folder = dg.addFolder( name );
    }

    // 'use strict';

    // states: open, closed, locked, unlocked
    // events: opening, closing, interact, unlock

    // var x = new THREE.Mesh( new THREE.BoxGeometry( 1, 2, 0.1 ), new THREE.MeshPhongMaterial( {visible: false } ) );
    // x.position.set( 0, 1, 0 );
    // scene.add( x );

    // safe
    physics.makeStaticBox(new THREE.Vector3(1,0.3,1), new THREE.Vector3(0,0,0), undefined );

    var safewheel, safegriff, safedoor;
    var safedoorGroup = new THREE.Group();
    var safemodel = new THREE.Group();
    scene.add( safemodel );
    safemodel.position.set ( 0, 0, 0 );
    safemodel.add( sound1 );

    var xoffset = 0.54;
    var yoffset = 0.24;
    var zoffset = 0.57;

    safedoorGroup.position.set( xoffset, yoffset, zoffset );

    safemodel.add( safedoorGroup );

    var fsm;

    var manager = new THREE.LoadingManager();
    manager.onProgress = function( item, loaded, total ) {
        // console.log( item, loaded, total );
    };
    manager.onError = function( XHR ) {
        console.log("Error", XHR );
    };
    manager.onLoad = function() {

        // safegroup.add( safe );
        // safegroup.add( safedoor );
        // safedoor.rotation.y = Math.PI / 2;

        // safegroup.traverse( function( object ) {
        //     // console.log( object );
        //     if ( object instanceof THREE.Mesh ) {
        //         // console.log("geometry", object.geometry );
        //     }
        // } );
        // safegroup.rotation.y = Math.PI/2;

        var tweens = setupTweens();
        fsm = setupFSM( tweens );
       
    };


    var safeloader = new THREE.JSONLoader( manager ); 
    
    var onLoad = function() {

    };
    var onProgress = function( XHR ) {
        // console.log("onProgress", XHR );
    };
    var onError = function( XHR ) {
        console.log("Error", XHR );
    };

    function handleMesh( mesh ) {
        // scene.add( mesh );
        safemodel.add( mesh );
    }
 
    //safe
    // var url = "assets/models/safe/safe_joined.js";
    // safeloader.load( url, function callback(geometry, materials) {
    //     // safedoor = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        // safedoor.material.materials[ 2 ].shading = THREE.FlatShading;
    // }, onLoad, onProgress, onError );


    var url = "assets/models/safe/safe.js";
    safeloader.load( url, function callback(geometry, materials) {
        geometry.rotateY ( Math.PI / 2 );
        geometry.computeBoundingBox();
        var boundingBoxSize = geometry.boundingBox.max.sub( geometry.boundingBox.min );

        for ( var i = 0; i < materials.length; i ++ ) {
            var material = materials[ i ];
            // console.log( material );
            // material.shading = THREE.FlatShading;
        }
        // geometry.translate( xoffset, boundingBoxSize.y / 2, zoffset );

        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        mesh.position.set( 0, boundingBoxSize.y / 2, 0 );
        handleMesh( mesh ); 

    }, onLoad, onProgress, onError );

    // var safedoor;
    var url = "assets/models/safe/safe_great_door.js";
    safeloader.load( url, function callback(geometry, materials) {
        geometry.rotateY ( Math.PI / 2 );
        geometry.center();
        geometry.computeBoundingBox();
        var boundingBoxSize = geometry.boundingBox.max.sub( geometry.boundingBox.min );
        // console.log ( boundingBoxSize );

        geometry.translate( -boundingBoxSize.x / 2, 0, 0 );
        // for ( var i = 0; i < materials.length; i ++ ) {
        //     var material = materials[ i ];
        //     material.shading = THREE.FlatShading;
        // }
        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        // mesh.position.set( xoffset + 0.55, 0.25, zoffset + 0.57 );
        mesh.position.set( 0, boundingBoxSize.y - 0.11, 0 );

        safedoor = mesh;
        handleMesh( mesh );

        safedoor = mesh;
        safedoorGroup.add( mesh );

    }, onLoad, onProgress, onError );     

    // big wheel
    var url = "assets/models/safe/safe_wheel.js";
    safeloader.load( url, function callback(geometry, materials) {
        geometry.rotateY ( Math.PI / 2 );
        // geometry.center();
        // geometry.translate( -0.531 + xoffset, 0.681 + 0.25, 0.106 + zoffset );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        mesh.position.set( - 0.54, 0.681, 0.106 );
        handleMesh( mesh );

        safewheel = mesh;
        safedoorGroup.add( mesh );

    }, onLoad, onProgress, onError ); 

    // griff
    var url = "assets/models/safe/safe_griff.js";
    safeloader.load( url, function callback(geometry, materials) {
        geometry.rotateY ( Math.PI / 2 );
        // geometry.translate( -0.8216, 1.2544 + 0.25, 0.04 );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        mesh.position.set( -0.832, 1.2624, 0.04 );
        handleMesh( mesh );

        safegriff = mesh;
        safedoorGroup.add( mesh );

    }, onLoad, onProgress, onError ); 

    function setupTweens() {

    	function tweenVector( source, target, time, easing ) {
    		return new TWEEN.Tween( source ).to( {
    			x: target.x,
    			y: target.y,
    			z: target.z
    		}, time )
    		.easing( easing );
    	}

    	// open wheel
    	var source = safewheel.rotation;
        var target = new THREE.Vector3( 0, 0, - Math.PI * 2 );
        var time = 2000;
        var easing = TWEEN.Easing.Sinusoidal.InOut;
        var turn_wheel = tweenVector( source, target, time, easing );

        // close wheel
        var target = new THREE.Vector3( 0, 0, Math.PI * 2 );
        var close_wheel = tweenVector( source, target, time, easing );

        // open door
        var source = safedoorGroup.rotation;
        var target = new THREE.Vector3( 0, Math.PI / 2, 0 );
        var time = 2000;
        var easing = TWEEN.Easing.Back.Out;
        var open_door = tweenVector( source, target, time, easing );

        // close door
        var target = new THREE.Vector3( 0, 0, 0 );
        var time = 1000;
        var easing = TWEEN.Easing.Quadratic.In;
        var close_door = tweenVector( source, target, time, easing );

        // open grip
        var source = safegriff.rotation;
        var target = new THREE.Vector3( 0, 0, Math.PI * 2 );
        var time = 2000;
        var easing = TWEEN.Easing.Quadratic.InOut;
        var spin_griff = tweenVector( source, target, time, easing );

        // close_door.chain( close_wheel );      
        // wheel.chain( door );

        // griff.chain( wheel );

        return {
        	unlock: spin_griff,
        	wheel: turn_wheel,
        	open: open_door,
        	close: close_door
        };

    }

    function setupFSM( tweens ) {

    	var fsm = StateMachine.create({

			initial: 'locked',
			events: [
				{ name: 'reset', from: '*',  to: 'locked' },
				{ name: 'open', from: ['closed','unlocked'], to: 'opened' },
				{ name: 'close', from: 'opened', to: 'closed'   },
				{ name: 'unlock', from: 'locked', to: 'unlocked' },
				{ name: 'interact', from: ['closed','unlocked'], to: 'opened' },
				{ name: 'interact', from: 'opened', to: 'closed' },
				{ name: 'interact', from: 'locked', to: 'opened' },
			],
			callbacks: {
				onclosed: function(event, from, to, msg) { 

					tweens.open.stop();
				    tweens.close.start();
				    tweens.close.onComplete( 
				                            function() { 
				                            	sound2.play(); 
				                            	// stop soundfile before finished
				    							setTimeout(function(){ sound2.stop(); }, 600);
				                            } );
				    sound3.play()

				},
				onopened: function() {

					tweens.close.stop();
					tweens.open.start();
					sound3.play();

				},
				onbeforeinteract: function(event, from, to) { 

				    // console.log( "onbeforeinteract", this.current ); 
				    
				    // if ( this.is( "locked" ) ) {
				    //     // alert("pause");
				    //     // some UI action, minigame, unlock this shit

				    // }
				    
				},
				onleavelocked: function() {

					tweens.wheel.onComplete( function() { 
						fsm.transition(); 
						sound1.stop();						
					} );
					tweens.unlock.chain( tweens.wheel );
					tweens.unlock.onComplete( function() { 
						sound1.play(); 
						// broken
						// sound1.gain.gain.exponentialRampToValueAtTime( 0.01, sound1.context.currentTime + 2.5 );
						
					} );
					tweens.unlock.start();
					// sound1.play();

					return StateMachine.ASYNC;

				},
				onunlocked: function() {
				    // this.open();
				},
		        onbeforereset: function( event, from, to ) {

		            // if ( to !== "locked" && this.can ( "close" ) ) {
		            //     this.close();
		            // }
		            safedoorGroup.rotation.set ( 0, 0, 0 );
		            safewheel.rotation.set( 0, 0, 0 );
		            safegriff.rotation.set( 0, 0, 0 );
		            sound1.setVolume( 0.1 )

		        },
			}

		});

		folder.open();
		folder.add( fsm, "current" ).name("Current State").listen();
		folder.add( fsm, "interact" ).name("interact");
		folder.add( fsm, "reset" ).name("Reset");
		
        folder.add( fsm, "unlock" ).name("unlock");
        folder.add( fsm, "open" ).name("open");
        folder.add( fsm, "close" ).name("close");

        return fsm;

    }

    
    /*
    fsmKeypad = StateMachine.create({

      initial: 'locked',
      events: [
        { name: 'pressing', from: 'idle', to: 'pressed' },
        { name: 'idle', from: 'pressed', to: 'idle' },
        { name: 'grant', from: 'locked', to: 'unlocked'   },
        { name: 'deny', from: 'locked', to: 'locked' },
      ],
      callbacks: {
        onpressing: function(event, from, to, msg) {  },
        onidle: function(event, from, to, msg) {  },
        ongrant: function(event, from, to, msg) { console.log("granted", this.current ); },
        ondeny: function(event, from, to, msg) { console.log("deny", this.current ); },
      }
    });
    */

    return fsm;
});