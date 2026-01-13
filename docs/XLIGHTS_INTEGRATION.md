# xLights Integration Guide

This guide explains how xDiagram integrates with xLights and how to use the integration effectively.

## Finding Your xLights Network File

xLights stores controller configuration in an XML file, typically named `xlights_networks.xml` or `NetworkFile.xml`. This file is usually located in your xLights show directory.

Common locations:
- **Windows**: `C:\Users\[YourName]\Documents\xLights\[ShowName]\xlights_networks.xml`
- **macOS**: `~/Documents/xLights/[ShowName]/xlights_networks.xml`
- **Linux**: `~/xLights/[ShowName]/xlights_networks.xml`

To find it in xLights:
1. Open xLights
2. Go to Setup → Controllers
3. The file path is shown at the top of the Controllers tab

## What Gets Imported

xDiagram reads the following information from your xLights network file:

### Controller Information
- **Name**: The controller name you set in xLights
- **Type**: Controller model (e.g., F16V4, FPP, ESPixelStick)
- **Protocol**: Communication protocol (ws2811, ws2801, DMX, etc.)
- **IP Address**: Network address (if applicable)

### Output/Port Configuration
For each controller output:
- **Port Number**: The physical output number on the controller
- **Description**: What's connected to this port
- **Start Channel**: First DMX/E1.31 channel
- **Total Channels**: Number of channels used
- **Max Pixels**: Calculated from channels (channels ÷ 3 for RGB)
- **Null Pixels**: Dead pixels at the start of the string
- **Protocol**: Protocol for this specific output

## Max Pixels Calculation

xDiagram automatically calculates the maximum number of pixels per port:

```
Max Pixels = Total Channels ÷ Channels Per Pixel
```

- **RGB pixels**: 3 channels per pixel
- **RGBW pixels**: 4 channels per pixel
- **Single channel**: 1 channel per pixel

For example:
- 3072 channels with RGB = 1024 pixels
- 2048 channels with RGB = 682 pixels (rounded down)

## Auto-Update Feature

When you connect xDiagram to your xLights network file:

1. xDiagram creates a file watcher on the XML file
2. Any time you save changes in xLights, xDiagram detects the change
3. The file is automatically re-parsed
4. Your diagram can be updated with the new configuration

This is especially useful when:
- Adding new controllers
- Changing port configurations
- Adjusting pixel counts
- Modifying controller settings

## Receiver Configuration

xLights doesn't directly track receiver information (like differential receivers with DIP switches), so you'll need to add these manually in xDiagram:

1. Add a Receiver node
2. Set the DIP switch setting (e.g., "0001", "0010", etc.)
3. Configure the ports (A, B, C, etc.)
4. Connect it to the appropriate controller output

## Example Workflow

1. **Design your show in xLights**
   - Add all your controllers
   - Configure outputs and assign pixel counts
   - Set up your props and models

2. **Export to xDiagram**
   - Copy the path to your `xlights_networks.xml` file
   - In xDiagram, paste the path and click "Connect to xLights"
   - Controllers will be imported (though you may need to manually add them to the diagram initially)

3. **Build your wiring diagram**
   - Add controllers from your xLights configuration
   - Add power supplies
   - Add receivers with DIP switch settings
   - Connect everything with colored wires

4. **Keep it synchronized**
   - As you update your xLights configuration, xDiagram will detect changes
   - You may need to manually update the diagram layout, but the data will be current

## Troubleshooting

### "File not found" error
- Check that the path is correct
- Make sure the file exists and is readable
- On Windows, use forward slashes or escape backslashes

### Auto-update not working
- Ensure the file path is correct
- Check that xLights is actually saving to that file
- Restart the xDiagram backend server

### Controller data not showing
- Verify the XML file is valid xLights format
- Check the browser console for parsing errors
- Try the example file in `examples/xlights_networks.xml`

## XML File Format

xDiagram expects the standard xLights network file format:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Networks>
  <Network>
    <Controller Name="..." Type="..." Protocol="..." IP="...">
      <Output Output="1" Description="..." Channels="..." />
      <Output Output="2" Description="..." Channels="..." />
    </Controller>
  </Network>
</Networks>
```

See `examples/xlights_networks.xml` for a complete example.

## Best Practices

1. **Keep xLights as source of truth**: Use xLights for controller configuration
2. **Use xDiagram for wiring**: Add the physical wiring details in xDiagram
3. **Save regularly**: Click Save after making diagram changes
4. **Version control**: Consider keeping your `diagram-data.json` in version control
5. **Document DIP switches**: Always note receiver DIP switch settings in xDiagram
6. **Label everything**: Use descriptive names and labels for easy reference

## Advanced: Custom Parsers

If you use a different show control software or have custom controller configurations, you can modify the XML parser in `src/server/xlights-parser.ts` to handle your specific format.
