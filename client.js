/*
This script will use the libraries installed in this step and automatically call the client.js script. 
In the client.js script, we will recieve the information on Port specified above (default: 8000) 
and do the following movements:
1) Changing the orientation of the IMU, you should see movements of the 3D model's (named Timmy) head movement. 
Mostly likely, due to difference in the initial orientation of the IMU, you might observe difference in axis of 
movement of the IMU and difference in movement of the Timmy's head. To fix this you should first read about the 
coordinate system of the BNO080 (chapter 4 of the original datasheet) and that of 
three.js (https://discoverthreejs.com/book/first-steps/transformations/). 
Also good old fashioned brute force always works too ;-).
2) Walking with the device and you should see Timmy walking also in the scene with the animation of the moving feet. 
To keepp things simple, Timmy at this point can only walk forward. You are free to tinker around and modify the script 
to enable more functionality.
*/
'use strict';

// Declare required variables
//Quaternion
var qx = 0;
var qy = 0;
var qz = 0;
var qr = 0;
var accuracy = 2;
var orderOfMag = (Math.PI/180);
var cube;
//var meshFloor;
var camera;
var renderer;
var scene;
var quat = new THREE.Quaternion();
var quat_prev = new THREE.Quaternion();
var quat_con = new THREE.Quaternion();
var quat_tim_head= new THREE.Quaternion();
var quat_org = new THREE.Quaternion(0,0,0,1);
var t=0;
var most_likely_act;
// Set the variable which controls movement of the 3D model
var speed = 10, degreesSpeed = .1;
var speed_walk=0.1;
var raycaster = new THREE.Raycaster();
var helper;
var meshFloor;
var meshWall;
var origin = new THREE.Vector2( 0, 0 );
const mixers = [];
const clock = new THREE.Clock();
var animation_walk;
var  action_still; 
var action_walk; 
var model_tim;
var model_tim_skeleton;
var model_tim_bones;
var model_tim_head_bone;
//var this_position;

// Make sure the port number is same as server.js and index.html
var socket = io();
socket.connect('http://localhost:8000'); 
// Add a connect listener to give affirmation of the connection
        socket.on('connect',function() {
        console.log('Client has connected to the server!');
});
// Initialize the scene
init();
// Run the function to read serial data and the gameloop
readSerial();

//
function readSerial(){
        // This event will be triggered when server.js send data

        socket.on('serial_update',function(data) {
        //console.log('Received a message from the server!',data);
        var dataArray = data.split(/ /);
        /* 
        I ensure that the values being sent are in 1) qx, 2) qy, 3) qz, 4) qr
        Please note I read the quaternion in this specific manner because this is what
        according to me to tranlate the coordinate system of BNO080 to that of three.js 
        If this does not work for you read the documentations of both and change accordingly 
        */
        // set x
        quat.x = (dataArray[1]);
        
        // set y
        quat.y = (dataArray[3]);

        // set z
        quat.z = (dataArray[2]);

        // set real
        quat.w = (dataArray[4]);
        //quat=quat.normalize.toFixed(accuracy);
        
        // activity recieved from the IMU
        most_likely_act=(dataArray[5]);

        console.log(quat.x + "," + quat.y + "," + quat.z +"," +quat.w+"," +most_likely_act);
        
        // according to new serial data recieved call the gameloop_render function 
        gameloop_render();
        });

}

/*
Initialization funtion: Nothing much to explain pretty basic function to set the scene and its elements including the 3D model. 
Change as per you requirements.
*/ 
function init() {

        scene = new THREE.Scene();  
        scene.background = new THREE.Color( 0x555555 );
        camera = new THREE.PerspectiveCamera( 100, window.innerWidth/window.innerHeight, 0.1, 1000 ); 
        camera.position.set(0, 15, 30);
        //camera.translateY(4);
        renderer = new THREE.WebGLRenderer(); 
        renderer.setSize( window.innerWidth, window.innerHeight ); 
        document.body.appendChild( renderer.domElement );
        
        var geometry = new THREE.BoxGeometry( 4, 4, 4 );
        
        var cubeMaterials = [ 
                //new THREE.MeshBasicMaterial({color:0xff0000, transparent:true, opacity:0.8, side: THREE.DoubleSide}),
                new THREE.MeshBasicMaterial({color:0xff0000, side: THREE.DoubleSide}),
                new THREE.MeshBasicMaterial({color:0x00ff00, side: THREE.DoubleSide}), 
                new THREE.MeshBasicMaterial({color:0x0000ff, side: THREE.DoubleSide}),
                new THREE.MeshBasicMaterial({color:0xffff00, side: THREE.DoubleSide}), 
                new THREE.MeshBasicMaterial({color:0xff00ff, side: THREE.DoubleSide}), 
                new THREE.MeshBasicMaterial({color:0x00ffff, side: THREE.DoubleSide}), 
        ]; 
        
        var cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterials); 
        cube = new THREE.Mesh(geometry, cubeMaterial);
        cube.translateY(4);
        cube.colorsNeedUpdate = true
       
        var meshFloorGeometry = new THREE.PlaneGeometry(100,100,1);
        var meshFloorMaterial = new THREE.MeshBasicMaterial({color: 0xff00ff,wireframe:true});
        meshFloor = new THREE.Mesh(meshFloorGeometry,meshFloorMaterial);
        meshFloor.rotateX(-Math.PI / 2) ;
        scene.add(meshFloor);
        
        var meshWallGeometry = new THREE.PlaneGeometry(50,50,1);
        var meshWallMaterial = new THREE.MeshBasicMaterial({color: 0x2194ce, side: THREE.DoubleSide});
        meshWall = new THREE.Mesh(meshWallGeometry,meshWallMaterial);
        meshWall.position.set(0,0,0);
        meshWall.translateY(25);
        meshWall.translateZ(50);
        scene.add(meshWall);
        var axesHelper = new THREE.AxesHelper(25);
        //scene.add( axesHelper );
        
        var helper_geometry = new THREE.ConeBufferGeometry( 3, 3, 3 );
		//helper_geometry.translate( 0, 5, 0 );
		helper_geometry.rotateX( -Math.PI / 2 );
        helper = new THREE.Mesh( helper_geometry, new THREE.MeshNormalMaterial() );
        
        // call the function to load 3D model
        loadModels();
        var ambient_light=new THREE.AmbientLight(0xffffff);
        scene.add(ambient_light);
        var hemisphere_light = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 );
        scene.add( hemisphere_light );
        //var ambient_light_2=new THREE.AmbientLight(0xffffff);
        //scene.add(ambient_light_2);
        
        /* 
        add event listener to move the camera using keyboard keys
        to look at what options are available look at the function below.
        */
        document.addEventListener("keydown", onDocumentKeyDown, false);


    }
    
    /*
    A reusable function to set up the models. We're passing in a position parameter
    so that they can be individually placed around the scene. Here we are just loading one 3D model, 
    you are welcome to expand to more 
    */
    function loadModels() {

        const loader = new THREE.GLTFLoader();
      
        
        const onLoad = ( gltf, position ) => {
          
          model_tim = gltf.scene;
          model_tim.position.copy( position );
          //console.log(position)
          
          //model_tim_skeleton= new THREE.Skeleton(model_tim_bones);
          model_tim_skeleton= new THREE.SkeletonHelper(model_tim);
          model_tim_head_bone=model_tim_skeleton.bones[5];
          console.log(model_tim_head_bone);
          //console.log(model_tim_bones);
          animation_walk = gltf.animations[0];
          
          const mixer = new THREE.AnimationMixer( model_tim );
          mixers.push( mixer );
      
          action_walk = mixer.clipAction( animation_walk );
          // Uncomment you need to change the scale or position of the model 
          //model_tim.scale.set(1,1,1);
          //model_tim.rotateY(Math.PI) ;

          scene.add( model_tim );
          
        //model_tim.geometry.computeBoundingBox();
        //var bb = model_tim.boundingBox;
         var bb = new THREE.Box3().setFromObject(model_tim);
         var object3DWidth  = bb.max.x - bb.min.x;
         var object3DHeight = bb.max.y - bb.min.y;
         var object3DDepth  = bb.max.z - bb.min.z;
         console.log(object3DWidth);
         console.log(object3DHeight);
         console.log(object3DDepth);
         // Uncomment if you want to change the initial camera position
         //camera.position.x = 0;
         //camera.position.y = 15;
         //camera.position.z = 200;
         
        
        };
      
        
      
        // the loader will report the loading progress to this function
        const onProgress = () => {console.log('Someone is here');};
      
        // the loader will send any error messages to this function, and we'll log
        // them to to console
        const onError = ( errorMessage ) => { console.log( errorMessage ); };
      
        // load the first model. Each model is loaded asynchronously,
        // so don't make any assumption about which one will finish loading first
        const tim_Position = new THREE.Vector3( 0,0,0 );
        loader.load('Timmy_sc_1_stay_in_place.glb', gltf => onLoad( gltf, tim_Position ), onProgress, onError );
      
      }
    
    /*
    This function contains the game logic and uses the quaternion obtained serially to move the 3D object
    */
    function gameloop_render() {
        // get the time between each call and send the interval to mixer
        update();
       
       /* 
       To avoid rendering if there is no activity we check whether current orientation is
       same as the previous orientation and to avoid rendering small changes due to small jitters
       in signal , we check the difference between current and previous quaternions (in degrees)
       Here the difference should be > 3 degrees. If you want the VR experience you move the camera also 
       inside the logic. 
       */
        if (!(quat.equals(quat_prev)) && (quat.angleTo(quat_prev)/orderOfMag)>3 )
        {
                //console.log(camera.position);
                    quat=quat.normalize();
                    t = ( t + 0.1 ) % 1;
                    
                THREE.Quaternion.slerp( quat_prev, quat, model_tim_head_bone.quaternion, t );
                quat_tim_head=model_tim_head_bone.quaternion.normalize();
                
        }
        // in case the activity detected as walking move the model at prespecified speeds
        if (most_likely_act=='6')
        {
            //console.log('walk');
            //animation_walk.loop(THREE.LoopOnce);
            action_walk.play();
            model_tim.translateZ(speed_walk);
            var this_position=model_tim.position;
            this_position.x=Math.round (this_position.x * 1e2)/ 1e2;
            this_position.y=Math.round (this_position.y * 1e2)/ 1e2;
            this_position.z=Math.round (this_position.z * 1e2)/ 1e2;
            model_tim.position.set(this_position.x,this_position.y,this_position.z);
            model_tim_head_bone.quaternion.copy(quat_tim_head);
            //model_tim_head_bone.quaternion(quat_tim_head);
            //action_walk.halt(2);
            //quat_con=quat.inverse();
        }
        else if(most_likely_act=='4')
        {
            action_walk.stop();
        } 
        renderer.render( scene, camera );
        quat_prev.copy(quat);
    }
        
        // Add a disconnect listener
        socket.on('disconnect',function() {
        console.log('The client has disconnected!');
        });

function update() {

            const delta = clock.getDelta();
          
            for ( const mixer of mixers ) {
          
              mixer.update( delta );
          
            }
          
}

/* 
Move the camera with keyboard to give additional control to user to visualize the scene 
Apart from the normal camera control, you can also use the raycaster function by using 
'r' key. Here the raycaster only looks for the intersection between camera and meshwall geometry. 
At the first point of intersection, a small conical object is automatically placed.
*/
function onDocumentKeyDown(event) {
        switch(event.keyCode) {
                case 87:
                    camera.rotation.x -= degreesSpeed;
                    //console.log('W');
                    break;
                case 83:
                    camera.rotation.x += degreesSpeed;
                    //console.log('S');
                    break;
                case 65:
                    camera.rotation.y += degreesSpeed;
                    //console.log('A');
                    break;
                case 68:
                    camera.rotation.y -= degreesSpeed;
                    //console.log('D');
                    break;
                case 32:
                    camera.position.set(0, 0, 10);
                    //console.log('Space');
                    break;
                
                case 38: // (up)
                    camera.translateZ(-speed);
                    
                break;
        
                case 40: // (down)
                        camera.translateZ(speed);
                    
                break;
                
                case 37: // (left)
                    camera.translateX(-speed);
                    
                break;
        
                case 39: // (right)
                        camera.translateX(speed);
                    
                break;

                case 82:
                    raycaster.setFromCamera( origin, camera );

                    var intersects = raycaster.intersectObject( meshWall );

				    // Toggle rotation bool for meshes that we clicked
                    if ( intersects.length > 0 )
                    {

					    helper.position.set( 0, 0, 0 );
					    helper.lookAt( intersects[ 0 ].face.normal );

					    helper.position.copy( intersects[ 0 ].point );

                    }
                    scene.add( helper );
        
                break;
              
        }
        renderer.render( scene, camera );
        //console.log(camera.position);
};

