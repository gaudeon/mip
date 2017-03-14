#!/usr/bin/env node

(function() {
    'use strict';

    var noble = require('noble');

    noble.startScanning();

    noble.on('discover', function(dev) {
        if(dev.advertisement.localName && dev.advertisement.localName.match(/^WowWee-MiP/)) {
            console.log('found ' + dev.advertisement.localName + ' - ' + dev.uuid);

            dev.on('connect', function() {
                console.log('connected..');
                dev.discoverServices(['ffe5'],function(error, services) {
                    var ws = services[0];
                    if(! ws) {
                        console.log('Write service not found');
                        return;
                    }

                    ws.discoverCharacteristics(['ffe9'], function(error, characteristics) {
                        var wc = characteristics[0];
                        if(! wc) {
                            console.log('Write characteristic not found');
                            return
                        }
                        
                        var data = new Buffer([0x78, 0x21, 0]);
                        wc.write(data);
                        var data = new Buffer([0x78, 0x21, 0]);
                        wc.write(data);
                        var data = new Buffer([0x78, 0x21, 0]);
                        wc.write(data);
                        var data = new Buffer([0x78, 0x21, 0]);
                        wc.write(data);
                        var data = new Buffer([0x78, 0x21, 0]);
                        wc.write(data);

                        /* // burping 
                        var data = new Buffer([0x06, 2, 0, 100, 0]);
                        wc.write(data); */

                        /* // playing music and dancing
                        var data = new Buffer([0x06, 23, 20, 47, 0, 48, 0, 47, 0, 48, 20, 19]);
                        wc.write(data);

                        setTimeout(function(){
                            wc.write(new Buffer([0x74, 72, 1]));
                        },2000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x73, 72, 1]));
                        },4000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x74, 72, 1]));
                        },6000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x73, 72, 1]));
                        },8000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x74, 72, 1]));
                        },10000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x73, 72, 1]));
                        },12000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x74, 72, 1]));
                        },14000);
                        setTimeout(function(){
                            wc.write(new Buffer([0x73, 72, 1]));
                        },16000);
                        */

                        /* Browsing sounds
                        var s = 1;
                        var e = 107;
                        var delay = 1000;
                        var data = new Buffer([0x06, s, 100]);
                        wc.write(data);
                        console.log('sound: ' + s);

                        wc.on('write',function() {
                            s = s + 1;
                            if(s < e) {
                                setTimeout(function() {
                                    data = new Buffer([0x06, s, 100]);
                                    wc.write(data);
                                    console.log('sound: ' + s);
                                }, delay);
                            }
                        }); */
                    });
                });
            });

            dev.connect();
        }
    });

})();
