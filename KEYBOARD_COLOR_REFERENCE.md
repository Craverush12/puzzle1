# Virtual Keyboard Color Reference

## Design Specifications Applied

Based on the provided design insights, the virtual keyboard now uses the following color scheme:

### Background Colors
- **Keyboard Background**: `#001E27` (bg - 001E27)
  - The darkest teal color forming the base of the entire keyboard

### Key Colors
- **Other Keys**: `#003437` (other keys - 003437)
  - Alphanumeric keys (Q-P, A-L, Z-M) and the period ('.') key
  - Dark teal, slightly lighter than the background

- **Action Keys**: `#005E60` (action keys - 005E60)
  - Functional keys: Shift, Backspace, "123", Microphone, Space, Enter
  - Distinct, brighter shade of teal compared to other keys

### Interactive States
- **Hover State**: Slightly lighter variations for better user feedback
- **Active State**: Slightly darker variations for tactile feedback
- **Shift Active**: Special highlighting when shift is engaged

### CSS Variables
The colors are defined as CSS custom properties for easy maintenance:
```css
--keyboard-bg: #001E27;
--keyboard-action-keys: #005E60;
--keyboard-other-keys: #003437;
```

### Implementation
- All colors are applied with `!important` to ensure they override any conflicting styles
- The keyboard maintains its responsive design and touch optimization
- Colors match the exact specifications provided in the design insights
