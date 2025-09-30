// rc_controller.ts - Core logic file for the Microbit RC Controller Extension

// Define a custom namespace for our blocks
namespace microbitRC {
    
    // --- Configuration & State Variables ---
    const RADIO_GROUP = 1;     
    const RAW_MAX = 1023;
    const TILT_DEADZONE = 150; 

    // Global state variables for the flight channels
    let throttle = 0;   
    let yaw = 512;      
    let isControllerActive = false; // Flag to ensure the loop runs only after initialization

    /**
     * Scales accelerometer raw input (-1024 to 1024) to the 0 to 1023 RC range.
     * @param raw The raw accelerometer reading (e.g., input.acceleration(Dimension.X))
     */
    function scaleAccelerometer(raw: number): number {
        // 1. Apply Deadzone
        if (Math.abs(raw) < TILT_DEADZONE) {
            raw = 0;
        }
        
        // 2. Map -1024..1024 to 0..2048 (by adding 1024)
        let shifted = raw + 1024;
        
        // 3. Scale 0-2048 to 0-1023
        let scaled = Math.round(shifted * (RAW_MAX / 2048));
        
        // 4. Clamp the final value
        return Math.constrain(scaled, 0, RAW_MAX);
    }

    // --- Block Definition: Initialization ---

    /**
     * Sets up the radio and starts the continuous RC transmission loop.
     * @param group The radio channel to use, must match the receiver's group. eg: 1
     */
    //% block="start RC controller on radio group %group"
    //% group.defl=1
    //% weight=100
    export function startController(group: number) {
        if (isControllerActive) return;

        radio.setGroup(group);
        radio.setTransmitPower(7); // Max power
        
        // Initialize state
        throttle = 0;
        yaw = 512;
        isControllerActive = true;
        basic.showIcon(IconNames.No); // Initial state icon
        
        // Start the continuous transmission loop
        basic.forever(transmitLoop);

        // Set up button handlers (these should only be initialized once)
        input.onButtonPressed(Button.B, () => {
            throttle = Math.min(throttle + 100, RAW_MAX);
        });

        input.onButtonPressed(Button.A, () => {
            throttle = Math.max(throttle - 100, 0);
        });

        input.onButtonPressed(Button.AB, () => {
            yaw = 512;
            throttle = 0;
            basic.showIcon(IconNames.Target); // Center icon on reset
        });
    }

    // --- Main Transmission Loop ---

    function transmitLoop() {
        if (!isControllerActive) return;

        // 1. Get Roll and Pitch from Accelerometer
        // Roll (Aileron) from X-axis tilt.
        let rcRoll = scaleAccelerometer(input.acceleration(Dimension.X));

        // Pitch (Elevator) from Y-axis tilt (negated for intuitive control).
        let rcPitch = scaleAccelerometer(-input.acceleration(Dimension.Y));
        
        // 2. Format and Transmit Data (Format: "THR,AIL,ELE,RUD")
        let radioPacket = `${throttle},${rcRoll},${rcPitch},${yaw}`;
        
        radio.sendString(radioPacket);
        
        // 3. Visual Feedback: Flash bottom center LED
        if (input.runningTime() % 200 < 100) {
            led.plot(2, 4);
        } else {
            led.unplot(2, 4);
        }
        
        // Control loop frequency: ~66Hz (15ms delay)
        basic.pause(15); 
    }
}
