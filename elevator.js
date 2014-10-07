(function(document){
    'use strict';

    function Elevator(elevator, storeys, storeyHeight){
        /*
        *   there are two principal concepts that need to be strictly followed
        *
        *   1) An elevator must not change direction when it's moving, no matter what other buttons are pressed
        *   2) An elevator must move to the floor only if the doors are closed.
        *
        * */

        this.doorsAutocloseIn = 3000;
        this.storeyHeight = storeyHeight;
        this.floorsQueue = [];
        this.elevator = elevator;
        this.storeys = storeys;
        this.elevatorEntrance = this.elevator.parentNode;
        this.cabin = this.elevator.getElementsByClassName('elevator__cabin')[0];
        this.doors = this.elevator.getElementsByClassName('elevator__door');
        this.buttons = this.elevatorEntrance.getElementsByClassName('elevator-button');
        this.buttonsPanel = this.elevatorEntrance.getElementsByClassName('elevator__floor-choice')[0];
        this.panelButtons = this.buttonsPanel.getElementsByClassName('elevator__floor-choice-button');
        this.indicators = this.elevatorEntrance.getElementsByClassName('indicator');
        this.doorsOpen = false;
        this.isEngaged = false;
        this.currentFloor = 1;

        this.init();
        this.listenForCalls();
    }

    Elevator.prototype = {
        "init": function(){
            this.createCustomEvents();
        },
        "listenForCalls": function(){
            var self = this;

            this.elevatorEntrance.addEventListener('click', function(e){
                var target = e.target;

                if( target.nodeName !== 'BUTTON' ) return;

                var floor = target.getAttribute('data-floor-number');

                self.disableFloorButton(floor);
                self.showIndicatorState(floor, 'called');

                if( target.classList.contains('elevator-button') ) {
                    self.addFloorToQueue(floor);
                }

                if( target.classList.contains('elevator__floor-choice-button') ) {
                    self.setFloorToGo(floor);
                }
            });

            this.elevatorEntrance.addEventListener('queueChangedEvent', function(){
                if( ! self.isEngaged ) {
                    if( self.getFloorToGo() == self.currentFloor ) {
                        self.dispatchEvent(self.elevatorArrivedEvent);
                    } else {
                        self.moveToFloor();
                    }
                    self.isEngaged = true;
                }
            });

            this.elevatorEntrance.addEventListener('elevatorArrivedEvent', function(){
                self.currentFloor = self.floorsQueue.shift();
                self.showIndicatorState(self.currentFloor, 'active');
                self.openDoors();
            });

            this.elevatorEntrance.addEventListener('doorsOpenEvent', function(){
                self.disableFloorPanelButton(self.currentFloor);
                self.showFloorChoice();
                self.doorsAutocloseTimeout = setTimeout(function(){
                    self.closeDoors();
                }, self.doorsAutocloseIn);
            });

            this.elevatorEntrance.addEventListener('doorsClosedEvent', function(){
                self.hideFloorChoice();
                self.enableFloorButton();
                self.enableFloorPanelButton();
                self.dimIndicator();

                if( self.floorsQueue.length == 0 ) {
                    self.isEngaged = false;
                } else {
                    if( ! self.doorsOpen ) {
                        self.moveToFloor();
                        clearTimeout(self.doorsAutocloseTimeout);
                    }
                }
            });

            this.elevatorEntrance.addEventListener('transitionend', function(e){
                var targetClassList = e.target.classList;

                if(targetClassList.contains('elevator__cabin')) {
                    self.dispatchEvent(self.elevatorArrivedEvent);
                } else if( targetClassList.contains('elevator__door')) {
                    if(e.propertyName == 'left') {
                        if( targetClassList.contains('elevator__door--open') ) {
                            self.doorsOpen = true;
                            self.dispatchEvent(self.doorsOpenEvent);
                        } else {
                            self.doorsOpen = false;
                            self.dispatchEvent(self.doorsClosedEvent);
                        }
                    }
                    e.stopPropagation();
                }
            });
        },
        "hideFloorChoice": function(){
            this.buttonsPanel.classList.remove('elevator__floor-choice--active');
        },
        "showFloorChoice": function(){
            this.buttonsPanel.classList.add('elevator__floor-choice--active');
        },
        "openDoors": function(){
            this.doors[0].classList.add('elevator__door--open');
            this.doors[1].classList.add('elevator__door--open');
        },
        "closeDoors": function(){
            this.doors[0].classList.remove('elevator__door--open');
            this.doors[1].classList.remove('elevator__door--open');
        },
        "moveToFloor": function(){
            var floorToGo = this.getFloorToGo() - 1;

            this.cabin.style.bottom = floorToGo * this.storeyHeight - 1 + 'px';
        },
        "showIndicatorState": function(floor, state){
            for(var i = 0, len = this.storeys; i < len; i++){
                if( this.indicators[i].getAttribute('data-floor-number') == floor ) {
                    this.indicators[i].classList.add('indicator--' + state);
                }
            }
        },
        "dimIndicator": function(){
            for(var i = 0, len = this.storeys; i < len; i++){
                if( this.indicators[i].getAttribute('data-floor-number') == this.currentFloor ) {
                    this.indicators[i].classList.remove('indicator--called');
                    this.indicators[i].classList.remove('indicator--active');
                }
            }
        },
        "enableFloorButton": function(){
            for( var i = 0, len = this.storeys; i < len; i++){
                if( this.buttons[i].getAttribute('data-floor-number') == this.currentFloor ) {
                    this.buttons[i].removeAttribute('disabled');
                }
            }
        },
        "disableFloorButton": function(floor){
            for( var i = 0, len = this.storeys; i < len; i++){
                if( this.buttons[i].getAttribute('data-floor-number') == floor ) {
                    this.buttons[i].setAttribute('disabled', 'disabled');
                }
            }
        },
        "enableFloorPanelButton": function(){
            for( var i = 0, len = this.storeys; i < len; i++){
                if( this.panelButtons[i].getAttribute('data-floor-number') == this.currentFloor ) {
                    this.panelButtons[i].removeAttribute('disabled');
                }
            }
        },
        "disableFloorPanelButton": function(floor){
            for( var i = 0, len = this.storeys; i < len; i++){
                if( this.panelButtons[i].getAttribute('data-floor-number') == floor ) {
                    this.panelButtons[i].setAttribute('disabled', 'disabled');
                }
            }
        },
        "setFloorToGo": function(floor){
            var floorIndex = this.floorsQueue.indexOf(floor);

            //check if the chosen floor is in the queue and remove it
            if( floorIndex != -1 ) {
                this.floorsQueue.splice(floorIndex, 1);
            }

            this.disableFloorPanelButton(floor);

            this.floorsQueue.unshift(floor);

            if( this.doorsOpen ) {
                this.closeDoors();
            }
        },
        "addFloorToQueue": function(floor){
            this.floorsQueue.push(floor);
            this.dispatchEvent(this.queueChangedEvent);
        },
        "getFloorToGo": function(){
            return this.floorsQueue[0];
        },
        "createCustomEvents": function(){
            this.doorsOpenEvent = new CustomEvent('doorsOpenEvent');
            this.doorsClosedEvent = new CustomEvent('doorsClosedEvent');
            this.elevatorArrivedEvent = new CustomEvent('elevatorArrivedEvent');
            this.queueChangedEvent = new CustomEvent('queueChangedEvent');
        },
        "dispatchEvent": function(event){
            this.elevatorEntrance.dispatchEvent(event);
        }
    };

    function House( data ){
        this.storeys = data.storeys;
        this.entrances = data.entrances;

        this.build();
    }

    House.prototype = {
        "build": function(){
            var entrancesContainer = document.querySelector('.house__entrances'),
                html = "",
                storeysHTML = "",
                i;

            //build storeys
            for( i = 0; i < this.storeys; i++ ) {
                storeysHTML += '<li class="house__storey"><button class="elevator-button" data-floor-number="' + ( this.storeys - i ) + '" type="button">Call elevator</button><i class="indicator" data-floor-number="' + ( this.storeys - i ) + '"></i></li>';
            }

            //build entrances with storeys
            for( i = 0; i < this.entrances; i++ ){
                html += '<li class="house__entrance"><ol class="house__entrance-storeys" reversed>' + storeysHTML + '</ol></li>';
            }

            entrancesContainer.innerHTML = html;

            this.addElevators();
        },
        "addElevators": function(){
            var buttonsHTML = "";

            //build floor buttons
            for( i = 0; i < this.storeys; i++ ) {
                buttonsHTML += '<button class="elevator__floor-choice-button" data-floor-number="' + ( i + 1 ) + '" type="button">' + ( i + 1 ) + '</button>';
            }

            var storeyHeight = document.querySelector('.house__storey').offsetHeight,
                entrancesElems = document.getElementsByClassName('house__entrance'),
                elevatorHtml = '<div class="elevator"><div class="elevator__cabin"><div class="elevator__floor-choice">' + buttonsHTML + '</div><div class="elevator__doors"><div class="elevator__door elevator__door--left"></div><div class="elevator__door elevator__door--right"></div></div></div></div>',
                div;

            for( var i = 0; i < entrancesElems.length ; i++ ){
                div = document.createElement('div');
                div.innerHTML = elevatorHtml;

                var elevator = div.firstChild;

                entrancesElems[i].appendChild(elevator);

                new Elevator(elevator, this.storeys, storeyHeight);
            }
        }
    };

    window.House = House;
})(document);