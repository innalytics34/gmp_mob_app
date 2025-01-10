import { Buffer } from 'buffer';

export const generatePrintData = (ItemDescription, LotNo, QRCode, NoOfCone, TotalWeight) => {
    const qrData = QRCode;
    const qrDataBuffer = Buffer.from(qrData, 'utf-8');
    // Initialize: Reset printer settings to default values
    const initCommands = Buffer.concat([
        // Reset all settings to defaults
        Buffer.from('\x1b\x40', 'binary'), // ESC @ : Reset printer
        Buffer.from('\x1b\x61\x01', 'binary'), // ESC a 0 : Left align text
        Buffer.from('\x1b\x32', 'binary'), // ESC 2 : Reset line spacing (set to default)
        Buffer.from('\x1b\x21\x00', 'binary'), // ESC ! 0 : Normal text size (reset any bold or size changes)
    ]);

    // QR Code Commands (Reduced size and adjusted for smaller sticker)
    const qrCommands = Buffer.concat([
        Buffer.from('\x1B\x61\x01', 'binary'), // Align QR code to the right
        Buffer.from('\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', 'binary'), // Model 2 QR Code
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x43\x03', 'binary'), // Size 2 QR Code (smaller size)
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x45\x30', 'binary'), // Error correction
        Buffer.concat([
            Buffer.from('\x1D\x28\x6B', 'binary'),
            Buffer.from([(qrDataBuffer.length + 3) & 0xFF, (qrDataBuffer.length + 3) >> 8]),
            Buffer.from('\x31\x50\x30', 'binary'),
            qrDataBuffer,
        ]),
        Buffer.from('\x1D\x28\x6B\x03\x00\x31\x51\x30', 'binary'), // Print QR code
    ]);

    // Text Commands (with reduced font size)
    const textCommands = Buffer.concat([
        // Select Font A (for the first text)
        Buffer.from('\x1B\x4D\x01', 'binary'),  // ESC M 1 : Font A
        Buffer.from('\x1D\x21\x08', 'binary'),  // ESC ! 8 : Smaller font size

        // Print the first text (a)
        Buffer.from(`${ItemDescription}\n`, 'utf-8'),

        // Select Font B (for the second text)
        Buffer.from('\x1B\x4D\x01', 'binary'),  // ESC M 0 : Font B
        Buffer.from('\x1D\x21\x08', 'binary'),  // ESC ! 8 : Smaller font size
        
        // Print the second text (b)
        Buffer.from(`${'L:' + LotNo + ' Cone:' + NoOfCone + ' WT:' + TotalWeight}\n`, 'utf-8'),
    ]);

    // Combine all commands: Reset printer, print text, and print QR code
    const combinedCommands = Buffer.concat([
        // initCommands,  // Initialize the printer
        textCommands,  // Print text
        qrCommands,    // Print QR code
        Buffer.from('\x1b\x64\x02', 'binary'),  // Feed 2 lines
        Buffer.from('\x1b\x64\x00', 'binary'),  // Feed paper (reset position if needed)
    ]);

    return combinedCommands.toString('base64');
};
