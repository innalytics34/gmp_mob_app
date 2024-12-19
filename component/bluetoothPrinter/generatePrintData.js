import { Buffer } from 'buffer';

export const generatePrintData = (a, b, c) => {
    const qrData = c;
    const qrDataBuffer = Buffer.from(qrData, 'utf-8');

    // QR Code Commands (Reduced size and adjusted for smaller sticker)
    const qrCommands = Buffer.concat([
      Buffer.from('\x1B\x61\x01', 'binary'), // Align QR code to the right
      Buffer.from('\x1D\x28\x6B\x04\x00\x31\x41\x32\x00', 'binary'), // Model 2 QR Code
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x43\x03', 'binary'), // Size 3 QR Code (smaller size)
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x45\x30', 'binary'), // Error correction
      Buffer.concat([
        Buffer.from('\x1D\x28\x6B', 'binary'),
        Buffer.from([(qrDataBuffer.length + 3) & 0xFF, (qrDataBuffer.length + 3) >> 8]),
        Buffer.from('\x31\x50\x30', 'binary'),
        qrDataBuffer,
      ]),
      Buffer.from('\x1D\x28\x6B\x03\x00\x31\x51\x30', 'binary'), // Print QR code
    ]);

    const textCommands = Buffer.concat([  
      Buffer.from('\x1d\x56\x01', 'binary'),
      // Buffer.from('\x1d\x56\x00', 'binary'),
      Buffer.from('\x1B\x45\x01', 'binary'), // Bold text end
      Buffer.from('\x1B\x61\x01', 'binary'),
      Buffer.from('\x1b\x21\x00', 'binary'),
      Buffer.from('\x1b\x21\x00', 'binary'),
      Buffer.from(`${a}\n`, 'utf-8'),
      // Buffer.from('\x1b\x32\x2e', 'binary'),
      Buffer.from('\x1b\x64\x00', 'binary'),
      Buffer.from('\x1B\x45\x00', 'binary'),
      Buffer.from('\x1b\x21\x00', 'binary'),
      Buffer.from('\x1b\x21\x00', 'binary'),
      Buffer.from('\x1B\x61\x01', 'binary'),
      Buffer.from(`${b}\n`, 'utf-8')
    ]);

    // Combine Text and QR Code (Ensure they fit within 58mm width)
    const combinedCommands = Buffer.concat([
      textCommands,
      qrCommands,
      Buffer.from(`\x1b\x64\x02`, 'utf-8'),
      Buffer.from(`\x1b\x64\x00`, 'utf-8'),
      // Buffer.from(`\x1b\x64\x00`, 'utf-8'),
      // Buffer.from(`\x1b\x64\x01`, 'utf-8'),
      // Buffer.from(`\x1b\x40`, 'utf-8'),
    ]);
    return combinedCommands.toString('base64');
};