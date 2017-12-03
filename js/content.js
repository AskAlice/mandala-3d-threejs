var container;

var camera, scene, renderer, controls;
var shift = 0;
var lastPoint = null;
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
 
// Converts from radians to degrees.
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};
var container;
var camera, scene, projector, renderer;
var particleMaterial;
var objects = [];
var isRotating=false;
var gui = new dat.GUI();
mi = gui.addFolder('Mirrors');
sty = gui.addFolder('Style');
var values = new function() {
	this.Mirror = false;
	this.MirrorRotate = true;
	this.Translate = true;
	this.axes = 8;
	this.Color = 0x0000ff;
	this.Width = 1;
	this.colorshift = true;
	this.Cap = "round";
	this.shiftspeed = 1;
	this.Clear = function(){
		while(scene.children.length > 0){ 
	    	scene.remove(scene.children[0]); 
		}
		lastPoint = null;
		var axesHelper = new THREE.AxesHelper( 999);
		scene.add( axesHelper );
	}
	
}
mi.add(values, 'Mirror');
mi.add(values, 'MirrorRotate');
mi.add(values, 'Translate');
mi.add(values, 'axes',2,50).step(1);
mi.open();
sty.addColor(values, 'Color').listen();
sty.add(values, 'colorshift');
sty.add(values, 'shiftspeed', 0.05, 10);
sty.add(values, 'Width',0.1	,10);
sty.add(values, 'Cap', ["round","square","butt"]);
sty.open();
gui.add(values,'Clear');
function get3dPointZAxis(event)
{
   camPos = camera.position;
var mv = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY/window.innerHeight) * 2 + 1, 1).unproject(camera);
var m2 = new THREE.Vector3(0,0,0);
var pos = camPos.clone(); 
var p2 = camPos.clone();
p2.x = -p2.x;
p2.y = 0;
p2.z = 0;

pos.add(mv.sub(camPos).normalize().multiplyScalar(m2.distanceTo(camPos)));
return pos;
}

function startDraw(event)
{
	if(event.target.tagName != 'CANVAS')
		{
			lastPoint = null;
			return;
		}
	if(controls.enabled) return 
    lastPoint = get3dPointZAxis(event);    
}

function stopDraw(event)
{
	if(event.target.tagName != 'CANVAS')
		{
			lastPoint = null;
			return;
		}
	if(controls.enabled) return 
    lastPoint = null;
}

function doDraw(event)
{    
	if(event.target.tagName != 'CANVAS')
		{
			lastPoint = null;
			return;
		}
	if(controls.enabled) return 
    if( lastPoint )
    {
        var pos = get3dPointZAxis(event);
        if(values['colorshift']){
        	values['Color'] = new THREE.Color("hsl("+shift+", 100%, 50%)").getHex();
        	shift += values['shiftspeed'];
        	if(shift >= 360){
        		shift = 0;
        	}
        }
        var material = new THREE.LineBasicMaterial({
            color: values['Color'],
            linewidth: values['Width'],
            linecap: values['Cap']
        });

        var geometry = new THREE.Geometry();
        if( Math.abs(lastPoint.x - pos.x) < 500 && Math.abs(lastPoint.y - pos.y) < 500 && Math.abs(lastPoint.z - pos.z) < 500 )
        {

            geometry.vertices.push(lastPoint);
            geometry.vertices.push(pos);
            var line = new THREE.Line(geometry, material);
            //line.rotation.y = Math.atan2( ( camera.position.x - line.position.x ), ( camera.position.z - line.position.z ) );
            //console.log(vector.sub( camera.position ).normalize())
			/*var dir = vector.sub( camera.position ).normalize();
  			var dY = - camera.position.y / dir.y;
            line.position.applyMatrix4( camera.matrixWorld );
            */
            scene.add(line);
            if(values["Translate"]){
                    for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
                    var line2 = new THREE.Line(geometry, material);
                    line2.rotateY(rot);
                    scene.add(line2);
            	}
	        	if(values["Mirror"]){
	                for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
	                    var line2 = new THREE.Line(geometry, material);
	                    line2.rotateZ(Math.PI);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
        		}
        		if(values["MirrorRotate"]){
	                for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
	                    var line2 = new THREE.Line(geometry, material);
	                    line2.rotateX(Math.PI/2);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
	                for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
                 	 	var line2 = new THREE.Line(geometry, material);
	                    line2.rotateX(-Math.PI/2);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
	            	for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
                 	 	var line2 = new THREE.Line(geometry, material);
	                    line2.rotateX(-Math.PI/2);
	                    line2.rotateZ(Math.PI/2);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
	            	for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
                 	 	var line2 = new THREE.Line(geometry, material);
	                    line2.rotateX(-Math.PI/2);
	                    line2.rotateZ(-Math.PI/2);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
	            	for(rot = 0; rot < 2*Math.PI;rot += (2*Math.PI)/values['axes']){
                 	 	var line2 = new THREE.Line(geometry, material);
	                    line2.rotateX(Math.PI);
	                    line2.rotateY(rot);
	                    scene.add(line2);
	            	}
        		}
        	}else{
        		if(values["Mirror"]){
                   var line2 = new THREE.Line(geometry, material);
                    line2.rotateZ(Math.PI);
                     scene.add(line2);
            	}
        	}
        	

            lastPoint = pos;        
        }
        else
        {
            console.debug(lastPoint.x.toString() + ':' + lastPoint.y.toString() + ':' + lastPoint.z.toString()  + ':' + 
                        pos.x.toString() + ':' + pos.y.toString()  + ':' + pos.z.toString());
        }
    }
}
function doDrawt(event){
	if(event.target.tagName != 'CANVAS')
		{
			event.preventDefault();
			return;
		}
	event.y = event.touches[0].pageY;
	event.x = event.touches[0].pageX;
	if(event.x != null)
			doDraw(event);
		
}
function startDrawt(event){
	if(event.target.tagName != 'CANVAS')
		{
			event.preventDefault();
			return;
		}
	event.y = event.touches[0].pageY;
	event.x = event.touches[0].pageX;
	
	if(event.x != null)
			startDraw(event);
}

function onTouchEvent( event ) {
	if(event.touches.length == 1){
		controls.enabled = false;
	}
	if(controls.enabled) return;
	if(event.touches.length > 1){
			lastPoint = null;
			controls.enabled = true;
			controls.touchStart(event);
			return;
	}
	for ( var i = 0; i < event.touches.length; i++ ) {
		controls.enabled = false;
		event.clientY = Math.round(event.touches[i].pageY);
		event.clientX = Math.round(event.touches[i].pageX);
			if(lastPoint == null){
				lastPoint = get3dPointZAxis(event);  
			}
			else 
				doDraw(event);
	}

}


init();
animate();

function init() {

	renderer = new THREE.WebGLRenderer();
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );
	document.addEventListener( 'mousedown', startDraw, false );
    document.addEventListener( 'mouseup', stopDraw, false );
    document.addEventListener( 'mousemove', doDraw, false );
	document.addEventListener( 'touchstart', onTouchEvent, false );
    document.addEventListener( 'touchend', stopDraw, false );
    document.addEventListener( 'touchmove', onTouchEvent, false );

	scene = new THREE.Scene();
	scene.background = new THREE.Color( 0x222222 );

	camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 1000 );
	camera.position.set( 0, 0, 500 );

	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.target = scene.position;
	controls.rotateSpeed = 0.25;
	controls.up = true;
	gui.add(controls,'autoRotate');
	gui.add(controls,'autoRotateSpeed',0.001,50);
	document.addEventListener("keydown", shiftDown, false);
	document.addEventListener("keyup", shiftUp, false);

	function shiftDown(e) {
	  if(e.shiftKey && e.ctrlKey){
  		switch(e.keyCode){
  			case 37:
  				controls.left = true;
  			break;
  			case 38:
  				controls.up = true;
  			break;
  			case 39:
  				controls.right = true;
  			break;
  			case 40:
  				controls.down = true;
  			break;
  		}
		}else{
		  if(e.keyCode==16) {
		  	controls.enabled = true;
		  }
		}

	}
	function shiftUp(e) {
	  if(e.keyCode==16) {
	  	controls.enabled = false;
	  }
	}
	controls.minDistance = 10;
	controls.maxDistance = 500;
	controls.rotateSpeed = 5.0;

	scene.add( new THREE.AmbientLight( 0x222222 ) );

	var light = new THREE.PointLight( 0xffffff );
	light.position.copy( camera.position );
	scene.add( light );
	var axesHelper = new THREE.AxesHelper( 999);
	scene.add( axesHelper );
	//




	//


	


	//




}
function animate() {

	requestAnimationFrame( animate );

	controls.update();

	renderer.render( scene, camera );

}