// Tests the 'startController' block in the simulator.

basic.showString("RC Test");
microbitRC.startController(1);

// The test is successful if the "No" icon appears and the LED starts flashing, 
// indicating the transmission loop is active.
