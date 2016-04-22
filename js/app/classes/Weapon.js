/**
* Weapon Class
* 
*/

define([
	"three",
	"scene",
	"debugGUI",
	"physics",
	"sounds",
	"controls",
	"camera"
], function ( THREE, scene, debugGUI, physics, sounds, controls, camera ) {

	'use strict';

	function setIntervalX(callback, delay, repetitions) 
	{
	    var x = 0;
	    var intervalID = window.setInterval(function () {

	       callback(x);

	       if (++x === repetitions) {
	           window.clearInterval(intervalID);
	       }
	    }, delay);
	}

	var options = {
		energy: 50
	};

	var folder = debugGUI.getFolder("Shoot me Up");
	folder.open();
	folder.add( options, "energy" ).min( 1 ).max( 100 );


	var endPoint = new Goblin.Vector3();
	// var startPoint = new Goblin.Vector3();
	var startPoint = new THREE.Vector3();

	function raycast() {

		// var startPoint = camera.getWorldPosition();
		var startPoint = controls.getControls().getObject().getWorldPosition();
		var direction = camera.getWorldDirection();
		var distance = 40;

		endPoint.addVectors( startPoint, direction.multiplyScalar( distance ) );

		// scene.remove( arrowHelper );
		// var arrowHelper = new THREE.ArrowHelper( camera.getWorldDirection(), camera.getWorldPosition(), 5, 0xFF0000 );
		// var arrowHelper = new THREE.ArrowHelper( direction, pP, 5, 0xFF0000 );
		// scene.add( arrowHelper );

		// console.log( start, end );
		var intersections = physics.getWorld().rayIntersect( startPoint, endPoint );
		// todo
		// dont intersect with player cylinder -.-

		return intersections;

	}

	var invertNormalGoblin = new Goblin.Vector3();
	function applyImpulse( target ) {

		// console.log( target );
		sounds.positional.bow.bow.play();

		// var normal = target.normal;
		var body = target.object;
		var point = target.point;

		var pP = camera.getWorldPosition();
		// var invertPos = new THREE.Vector3();
		// var vec = new THREE.Vector3( point.x, point.y, point.z );
		// var vec = new Goblin.Vector3( pP.x, pP.y, pP.z );
		// var invertNormal = vec.clone().sub( pP ).normalize();

		// danger
		// math operation using THREE.Vector3
		// no obvious errors
		invertNormalGoblin.subtractVectors( point, pP );
		invertNormalGoblin.normalize();
		invertNormalGoblin.scale( options.energy );
		
		// body.applyImpulse( invertNormalGoblin );
		// body.applyForceAtLocalPoint( invertNormalGoblin, point );
		body.applyForceAtWorldPoint ( invertNormalGoblin, point );

	}

	function Weapon() {

		this.name = "";
		this.maxCapacity = 30;
		this.currentCapacity = this.maxCapacity;
		this.magazines = 3;
		this.shootDelay = 0;
		this.shootSound;
		this.reloadSound;
		this.emptySound = sounds.weaponclick;

		// fsm?
		this.reloading = false;

	}

	Weapon.prototype.toString = function() {

		return this.name + ": " + this.currentCapacity + "/" + this.maxCapacity * this.magazines + " Ammo";

	};

	Weapon.prototype.shoot = function( clock ) {

		if ( this.reloading === true ) return;

		var delay = clock.elapsedTime - this.lastShotFired;
		
		// exit when fireing to fast
		if ( delay < this.shootDelay ) { return; }
		
		this.lastShotFired = clock.elapsedTime;

		if( this.currentCapacity <= 0 ) {
			// play empty sound
			this.reload();
			return false;
		}

		// fire emitter
		this.alterCapacity( -1 );

		this.shootSound.isPlaying = false;
		// sounds.railgun.stop();
		this.shootSound.play();

		var intersections = raycast();

		if ( intersections.length > 0 ) {

			var target = intersections[ 0 ];

			if ( isFinite( target.object.mass ) ) {
				// is not static object
				// -> launch into space
				applyImpulse( target );

			}

		}


	};

	Weapon.prototype.restock = function( number ) {

	};

	Weapon.prototype.fireEffect = function( ammoPoint, ammoNormal, body ) {

	};

	Weapon.prototype.reload = function() {

		// dont reload if he is alreay reloading or the magazine is full
		if ( this.reloading === true || this.maxCapacity === this.currentCapacity ) return;

		if ( this.magazines === 0 ) {
			
			this.emptySound.play( 0.1 )
			return;
		}
		
		this.reloading = true;

		// single shells reload
		if( this.name === "shotgun" ) {
			
			var toggle = 2;
			var time = 300;
			var missing = this.maxCapacity - this.currentCapacity;
			var that = this;

			// instant mag reduce on reload
			// or do it when finished reloading?
			this.magazines--; 

			var intervalHandle = setIntervalX ( function ( x ) {

				// var origin = camera.getWorldPosition();
				// origin.x += toggle;
				// toggle *= -1;

				// that.reloadSound.playAtWorldPosition( origin );
				that.reloadSound.play();
				
				// that.currentCapacity ++;
				that.alterCapacity( 1 );

				if ( that.currentCapacity === that.maxCapacity ) {
					that.reloading = false;
				}
				
				that.onChanged();

			}, time, missing );
		} 
		// magazines reload
		else {

			var that = this;

			this.reloadSound.play( 0.4 );

			setTimeout( function () { 
				
				that.magazines--;
				that.reloading = false;
				// that.currentCapacity = that.maxCapacity;
				that.alterCapacity( that.maxCapacity );
			
			}, that.reloadTime * 1000 );

		}
	};

	Weapon.prototype.alterCapacity = function ( howMuch ) {

		this.currentCapacity += howMuch;

		// this.capacity -= howMuch;
		if( this.currentCapacity < 0 ) 
		{
			this.currentCapacity = 0;
		}
		this.onChanged();

	};

	
	Weapon.prototype.setCallback = function ( scope, callbackFunction )
	{

		this.scope = scope;
		this.callbackFunction = callbackFunction;

	};


	Weapon.prototype.onChanged = function () 
	{

		if( this.scope != null )
		{
			this.callbackFunction.call( this.scope );
		}

	};
	


	return Weapon;

});