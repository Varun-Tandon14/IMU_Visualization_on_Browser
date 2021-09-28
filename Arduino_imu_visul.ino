/*
  Using the BNO080 IMU
  By: Nathan Seidle
  SparkFun Electronics
  Date: December 21st, 2017
  License: This code is public domain but you buy me a beer if you use this and we meet someday (Beerware license).

  Feel like supporting our work? Buy a board from SparkFun!
  https://www.sparkfun.com/products/14586

  This example shows how to output the i/j/k/real parts of the rotation vector.
  https://en.wikipedia.org/wiki/Quaternions_and_spatial_rotation

  It takes about 1ms at 400kHz I2C to read a record from the sensor, but we are polling the sensor continually
  between updates from the sensor. Use the interrupt pin on the BNO080 breakout to avoid polling.

  Hardware Connections:
  Attach the Qwiic Shield to your Arduino/Photon/ESP32 or other
  Plug the sensor onto the shield
  Serial.print it out at 9600 baud to serial monitor.
*/

#include <Wire.h>

#include "SparkFun_BNO080_Arduino_Library.h"
BNO080 myIMU;

void setup()
{
  Serial.begin(9600);
  Serial.println();
  Serial.println("BNO080 Read Example");

  Wire.begin();

  //Are you using a ESP? Check this issue for more information: https://github.com/sparkfun/SparkFun_BNO080_Arduino_Library/issues/16
//  //=================================
//  delay(100); //  Wait for BNO to boot
//  // Start i2c and BNO080
//  Wire.flush();   // Reset I2C
//  IMU.begin(BNO080_DEFAULT_ADDRESS, Wire);
//  Wire.begin(4, 5); 
//  Wire.setClockStretchLimit(4000);
//  //=================================

  if (myIMU.begin() == false)
  {
    Serial.println("BNO080 not detected at default I2C address. Check your jumpers and the hookup guide. Freezing...");
    while (1);
  }

  Wire.setClock(400000); //Increase I2C data rate to 400kHz

  myIMU.enableRotationVector(50); //Send data update every 50ms
  uint32_t enableActivities = 0x1F; //Enable all 9 possible activities including Unknown

  //Send data update every 50ms, with sensor specific config word
  //Pass in a pointer to our activityConfidences array as well
  myIMU.enableActivityClassifier(50, enableActivities, activityConfidences);
  
  //Serial.println(F("Rotation vector enabled"));
  //Serial.println(F("Output in form i, j, k, real, accuracy"));
}

void loop()
{
  //Look for reports from the IMU
  if (myIMU.dataAvailable() == true)
  {
    
    float quatI = myIMU.getQuatI();
    float quatJ = myIMU.getQuatJ();
    float quatK = myIMU.getQuatK();
    float quatReal = myIMU.getQuatReal();
    //float quatRadianAccuracy = myIMU.getQuatRadianAccuracy();

    //Given a number between 0 and 8, print the name of the activity
    //See page 73 of reference manual for activity list
    /* what activitynumber <-> activity map
      if(activityNumber == 0) Serial.print("Unknown");
      else if(activityNumber == 1) Serial.print("In vehicle");
      else if(activityNumber == 2) Serial.print("On bicycle");
      else if(activityNumber == 3) Serial.print("On foot");
      else if(activityNumber == 4) Serial.print("Still");
      else if(activityNumber == 5) Serial.print("Tilting");
      else if(activityNumber == 6) Serial.print("Walking");
      else if(activityNumber == 7) Serial.print("Running");
      else if(activityNumber == 8) Serial.print("On stairs");
    */

    byte mostLikelyActivity = myIMU.getActivityClassifier();
    
    Serial.print(" ");
    Serial.print(quatI, 2);
    Serial.print(" ");
    Serial.print(quatJ, 2);
    Serial.print(" ");
    Serial.print(quatK, 2);
    Serial.print(" ");
    Serial.print(quatReal, 2);
    Serial.print(" ");
    Serial.print(mostLikelyActivity, 2);
    Serial.print(" ");
    //Serial.print(quatRadianAccuracy, 2);
    //Serial.print(F(","));

    Serial.println();
  }
}
