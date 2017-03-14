#!/usr/bin/env node

/* PS3 Controller Joystick Packet
 *  More than one packet can be sent at a time, each packet is 8 bytes long. Numbers below are in uint format
 *  Byte 4 and 5 - State (16 bit Integer - little endian)
 *      Type == button
 *          0 - button released
 *          1 - button pressed
 *      Type == analog
 *          A value between -32767 and 32767 that represents stick position along that axis (note on y axises down is positive)
 *          if the value is 0 that means the stick reset to a rest position
 *  Byte 6 - Type
 *      1   - button event
 *      2   - analog axis event
 *      129 - register button
 *      130 - register analog axis
 *  Byte 7 - Id
 *      Type == button
 *          0  - Square
 *          1  - X
 *          2  - Circle
 *          3  - Triangle
 *          4  - L1
 *          5  - R1
 *          6  - L2
 *          7  - R2
 *          8  - Select
 *          9  - Start
 *          10 - Left Analog Button
 *          11 - Right Analog Button
 *          12 - PS Button
 *      Type == analog
 *          0 - Left Analog, X axis
 *          1 - Left Analog, Y axis
 *          2 - Right Analog, X axis
 *          3 - Right Analog, Y axis
 *          4 - Dpad, X axis
 *          5 - Dpad, Y axis
 */

(function() {
    'use strict';
    
    var SerialPort = require("serialport").SerialPort
    var serialPort = new SerialPort("/dev/input/js0", {
      baudrate: 57600
    });
    
    serialPort.on("open", function () {
        serialPort.on('data', function(data) {
            console.log('----------------------------------');
            console.log(data);
            for(var p = 0; p < Math.floor(data.length / 8); p++) {
                var packet = new Buffer(8);
                data.copy(packet, 0, p * 8, p * 8 + 8);
                
                console.log(packet);
               
                var state = packet.readInt16LE(4);
                var type  = packet.readUInt8(6);
                var id    = packet.readUInt8(7);
                
                console.log('state: ' + state + ' type: ' + type + ' id: ' + id);
            }
        });
    });
})();
