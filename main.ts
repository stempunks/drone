// This file is the default starting point for a user's project after importing the extension.

basic.showString("CONTROLLER");

/**
 * The single block from the microbit-rc-controller extension is placed here.
 * It initializes the radio and starts the continuous accelerometer/button reading loop.
 * The radio group '1' is used here as a default.
 */
basic.forever(function () {
    microbitRC.startController(1)
})
