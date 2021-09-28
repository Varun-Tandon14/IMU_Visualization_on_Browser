# **IMU_Visualization_on_Browser**
This project uses BNO080 Sparkfun IMU + Arduino Uno + JavaScript +  HTML + openly available 3D model for visualization of the IMUs orientation (from quaternions)  and activity classification output. Please note this is just meant to be fun learning project and for all practical purposes, a lot of optimization is possible.

## **Prerequisites**
1. BNO080 Sparkfun IMU (Any other IMU will also work but you need to modify the code acordinly. Chosen BNO080 because this series IMUs directly gives quaternions as output, have series of well documented callibration steps and also provides the activity classification like device is still, walking, running etc. out-of-the-box).
2. Arduino UNO or other similar board from Arduino.
3. Basic knowledge of BNO080 documentation, quaternions, serial communication protocols, server-client etc will be very helpful in debugging the codes.  
## **Follow step by step to implement project**
#### **Step 1: Arduino Uno <-> BNO080 Integration**
Follow the guide given here (https://learn.sparkfun.com/tutorials/qwiic-vr-imu-bno080-hookup-guide#hardware-overview). This covers everything from the hardware to the communication protocols and the library installation.
#### **Step 2: Upload the Arduino code provided here**
This code uses the library installed the previous step and calculates the orientation of the device and runs the acitivy classifier. This data is thenn serially sent through your COM port (notice the port number) at a specified baud rate (9600 baud by default). Open the seiral port after uploading to verify the code
#### **Step 3: Run the (Node.js) server script**
##### Installations
1. Install the node.js library with any of your favourite manager. (https://nodejs.org/en/download/package-manager)
2. Install Socket.IO. (https://socket.io/docs/v3/server-installation/)
3. Install Expressjs (https://expressjs.com/)
##### Server.js script description:
This is meant to act as a bridge and forward the information it recieves from the COM port to a local client. Port number(default): 8000 
#### **Step 4: Run the Index.html** 
##### Installations
1. Install [three.js]. (https://threejs.org/docs/#manual/en/introduction/Installation)
You will be using some of the basic functionality of the three.js library, along with two important libraries when you install three.js (OrbitControls.js , GLTFLoader.js)
##### Client.js script description
This script will use the libraries installed in this step and automatically call the client.js script. In the client.js script, we will recieve the information on Port specified above (default: 8000) and do the following movements:
1. Changing the orientation of the IMU, you should see movements of the 3D model's (named Timmy) head movement. Mostly likely, due to difference in the initial orientation of the IMU, you might observe difference in axis of movement of the IMU and difference in movement of the Timmy's head. To fix this you should first read about the coordinate system of the BNO080 (chapter 4 of the original datasheet) and that of three.js (https://discoverthreejs.com/book/first-steps/transformations/). Also good old fashioned brute force always works too ;-).
2. Walking with the device and you should see Timmy walking also in the scene with the animation of the moving feet. To keepp things simple, Timmy at this point can only walk forward. You are free to tinker around and modify the script to enable more functionality

### Please note: It's been long time that I did project so you might have some problems running everything out of the box.
