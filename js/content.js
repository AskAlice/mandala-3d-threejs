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
var undoHistory = [];
var redoHistory = [];
var gui = new dat.GUI();
var values = new function() {
	this.Mirror = true;
	this.MirrorRotate = false;
	this.Translate = true;
	this.axes = 10;
	this.Color = 0x0000ff;
	this.Width = 1;
	this.colorshift = true;
	this.Cap = "round";
	this.shiftspeed = 4;
	this.MousePointMode = true;
	this.Help = function(){
		alert("Touch friendly. Two finger drag to rotate, or hold shift and use the mouse. CTRL+SHIFT+arrows = camera snap translate. Disable chrome://flags/#overscroll-history-navigation for better touch experience")
	};
	this.Undo = function(){
		if(undoHistory.length > 0){
			undoHistory = undoHistory.filter(function(elem, index, self) {
    			return index === self.indexOf(elem);
			});
			if(scene.children.length < 5 && redoHistory.length > 0){
				this.Redo();
				return;
			}
			console.table(undoHistory)
			num = undoHistory[1];
			h = [];
			for(i=scene.children.length;i>=num;i--){
				h.unshift(scene.children[i]);
				scene.remove(scene.children[i]);
			}
			if(undoHistory[0] > 2 && scene.children.length > 2)
				undoHistory.shift();
			if(h.length > 0)
				redoHistory.unshift(h);
			console.log(redoHistory);
		}
			
	}
	this.Redo = function(){
			if(redoHistory.length > 0){
				undoHistory.unshift(scene.children.length);
				num = redoHistory[0];
				for(i=0;i<num.length-1;i++){
					scene.add(num[i]);
				}	
				redoHistory.shift();
				if(undoHistory[0] != scene.children.length)
					undoHistory.unshift(scene.children.length);
				console.log(redoHistory)
			}
			
			
	}
	this.Clear = function(){
			h = [];
		while(scene.children.length > 0){ 
	    	scene.remove(scene.children[0]); 
	    	h.unshift(scene.children[0]);
		}
		redoHistory.unshift(h);
		lastPoint = null;
		var axesHelper = new THREE.AxesHelper( 999);
		scene.add( axesHelper );
		undoHistory = [3];
	}
	
}
gui.add(values,"Help");
mi = gui.addFolder('Mirrors');
sty = gui.addFolder('Style');
drw = gui.addFolder('Drawing');
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
drw.open();
drw.add(values,'Undo');
drw.add(values,'Redo');
drw.add(values, 'MousePointMode')
if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 sty.close();
 drw.close();
 mi.close();
 gui.close();
}
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var plane = new THREE.Plane();
var planeNormal = new THREE.Vector3();
var point = new THREE.Vector3();


function get3dPointZAxis(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  planeNormal.copy(camera.position).normalize();
  plane.setFromNormalAndCoplanarPoint(planeNormal, scene.position);
  raycaster.setFromCamera(mouse, camera);
  raycaster.ray.intersectPlane(plane, point);
     camPos = camera.position;
var mv = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY/window.innerHeight) * 2 + 1, 1).unproject(camera);
var m2 = new THREE.Vector3(0,0,0);
var pos = camPos.clone(); 
var p2 = camPos.clone();
pos.add(mv.sub(camPos).normalize().multiplyScalar(m2.distanceTo(camPos)));
var p = new THREE.Vector3(point.x,point.y,point.z)
if(values['MousePointMode'] == true)
	return p;
else
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
		controls.touchEnd(event);

	if(controls.enabled){ 
		return 

	}
	if(undoHistory[0] != scene.children.length)
		undoHistory.unshift(scene.children.length);
	redoHistory = [];
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
	drw.add(controls,'autoRotate');
	controls.autoRotateSpeed = 7;
	drw.add(controls,'autoRotateSpeed',0.001,50);
	drw.add(values,'Clear');
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
if(undoHistory[0] !=scene.children.length)
	undoHistory.unshift(scene.children.length);



}
function animate() {

	requestAnimationFrame( animate );

	controls.update();

	renderer.render( scene, camera );

}
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}