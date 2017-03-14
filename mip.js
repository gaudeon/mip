#!/usr/bin/env node

// CONSTANTS
//      Joystick
var JS_TYPE_BUTTON  = 1,
    JS_TYPE_ANALOG  = 2,
    JS_LEFT_ANALOG_X_AXIS = 0,
    JS_LEFT_ANALOG_Y_AXIS = 1,
//      MIP
    MIP_CONTINUOUS_DRIVE      = 0x78,
    MIP_FORWARD_MODIFIER      = 0,
    MIP_REVERSE_MODIFIER      = 32,
    MIP_ROTATE_RIGHT_MODIFIER = 64,
    MIP_ROTATE_LEFT_MODIFIER  = 96,
    MIP_RANGE_DIVISOR         = 1024, // split the range of 32767 into a number between 0 and 32
    MIP_MOVEMENT_TICK         = 50;   // interval in milliseconds to send movement info.


// Globals
var MIP_ACTIVE   = false, // Determines if we can talk to MIP or not
    writeToMIP   = function() {},  // When we are able to talk to the MIP, this will be set to a function that will take a Buffer as an argument and write it out to the MIP
    MIP_ROTATION = 0,          // Left/right Rotation
    MIP_MOVEMENT = 0;          // Moving forward/backward

(function() {
    'use strict';
    
    var noble = require('noble'); // BLE Communication
    
    var SerialPort = require("serialport").SerialPort // joystick over serial communication
    
    var serialPort = new SerialPort("/dev/input/js0", {
      baudrate: 57600
    });
    
    noble.startScanning();

    noble.on('discover', function(dev) {
        if(dev.advertisement.localName && dev.advertisement.localName.match(/^WowWee-MiP/)) {
            console.log('found ' + dev.advertisement.localName + ' - ' + dev.uuid);

            dev.on('connect', function() {
                console.log('Connected to MIP');
                dev.discoverServices(['ffe5'],function(error, services) {
                    var ws = services[0];
                    if(! ws) {
                        throw 'Write service not found';
                    }

                    ws.discoverCharacteristics(['ffe9'], function(error, characteristics) {
                        var wc = characteristics[0];
                        if(! wc) {
                            throw 'Write characteristic not found';
                        }
                        
                        writeToMIP = function(buffer) {
                            wc.write(buffer);
                        };
                        
                        MIP_ACTIVE = true;
                    });
                });
            });

            dev.connect();
        }
    });
    
    // Joystick input
    serialPort.on("open", function () {
        serialPort.on('data', function(data) {
            for(var p = 0; p < Math.floor(data.length / 8); p++) {
                var packet = new Buffer(8);
                data.copy(packet, 0, p * 8, p * 8 + 8);
                
                var state = packet.readInt16LE(4);
                var type  = packet.readUInt8(6);
                var id    = packet.readUInt8(7);
                
                if(type == JS_TYPE_ANALOG) {
                    if(id == JS_LEFT_ANALOG_Y_AXIS) {
                        if(state == 0) {
                            MIP_MOVEMENT = MIP_ROTATION = 0;
                        }
                        else {
                            var speed = Math.ceil(Math.abs(state) / MIP_RANGE_DIVISOR);
                            
                            if(state > 0) { // positive is down so move backwards, val is 33 to 96
                                MIP_MOVEMENT = speed + MIP_REVERSE_MODIFIER;
                            }
                            else { 
                                MIP_MOVEMENT = speed + MIP_FORWARD_MODIFIER;
                            }
                        }
                    }
                    
                    if(id == JS_LEFT_ANALOG_X_AXIS) {
                        if(state == 0) {
                            MIP_MOVEMENT = MIP_ROTATION = 0;
                        }
                        else {
                            var speed = Math.ceil(Math.abs(state) / MIP_RANGE_DIVISOR);
                            
                            if(state > 0) { 
                                MIP_ROTATION = speed + MIP_ROTATE_RIGHT_MODIFIER;
                            }
                            else { 
                                MIP_ROTATION = speed + MIP_ROTATE_LEFT_MODIFIER;
                            }
                        }
                    }
                }
            }
        });
    });
    
    // Send mip movement information
    var mip_movement = function() {
        if(MIP_ACTIVE) { // only do anything if MIP is active
            //console.log('move: ' + MIP_MOVEMENT + ' rot: ' + MIP_ROTATION);
            
            writeToMIP(new Buffer([0x78, MIP_MOVEMENT, MIP_ROTATION]));
        }
        
        setTimeout(mip_movement,MIP_MOVEMENT_TICK);
    };
    
    setTimeout(mip_movement,MIP_MOVEMENT_TICK); // Start attempting to send movement information
})();