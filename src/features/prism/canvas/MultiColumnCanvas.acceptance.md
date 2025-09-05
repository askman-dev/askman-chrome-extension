# MultiColumnCanvas Acceptance Criteria

---

## 🎯 Focus Mode Mouse Interaction Requirements

### Scenario 1: Content scrolling within column in focus mode
**Description**: Product manager wants to read conversation content without canvas movement interference

```
Given that I am in focus mode viewing a conversation column
And the column has scrollable content (messages longer than viewport)
And my mouse cursor is positioned inside the column area

When I scroll with mouse wheel or trackpad

Then the column content should scroll up/down within the column
And the canvas position should remain unchanged
And the canvas should not pan or move
```

### Scenario 2: Text selection within column in focus mode  
**Description**: Product manager needs to select and copy important conversation content with browser-native text selection behavior

```
Given that I am in focus mode viewing a conversation column
And there are text messages visible in the column
And my mouse cursor is positioned inside the column content area

When I click and drag to select text across multiple lines or messages

Then the text selection should work with native browser behavior
And selected text should be highlighted with the standard blue selection color
And the canvas should not pan or move during the entire text selection operation
And mouse down events should not propagate to canvas drag handlers
And I should be able to copy the selected text using Ctrl+C or right-click context menu
And the selection should work across message boundaries (user prompt + AI response)
And the selection should persist until I click elsewhere or start a new selection
```

### Scenario 2b: Text selection edge cases in focus mode
**Description**: Product manager expects robust text selection in various interaction scenarios

```
Given that I am in focus mode viewing a conversation column
And I have selected some text within a message

When I perform additional interactions (scrolling within column, clicking input field, using keyboard shortcuts)

Then the text selection should behave consistently with standard web applications
And scrolling within the column should not clear the selection
And clicking in the input field should clear the selection (standard behavior)
And ESC key should not clear text selection (only exit focus mode)
And keyboard shortcuts (Ctrl+A, Ctrl+C) should work on selected text
And right-click context menu should appear with copy/select options
```

### Scenario 3: Auto-exit focus mode via blank area scrolling
**Description**: Product manager expects intuitive mode switching when navigating canvas

```
Given that I am in focus mode viewing a conversation column
And my mouse cursor is positioned outside any column (in blank canvas area)

When I scroll with mouse wheel or trackpad

Then focus mode should automatically exit
And the canvas should pan/move normally in standard navigation mode
And I should return to normal canvas navigation without focus restrictions
And I can double-click any column to re-enter focus mode
And the focus mode indicator should disappear
```

### Scenario 4: Auto-exit focus mode via blank area dragging
**Description**: Product manager expects seamless transition to canvas navigation mode

```
Given that I am in focus mode viewing a conversation column
And my mouse cursor is positioned outside any column (in blank canvas area)

When I drag the mouse (click and move)

Then focus mode should automatically exit immediately
And the canvas should pan following my mouse movement in standard navigation mode
And the drag should provide smooth canvas navigation without focus restrictions
And I should see visual feedback during the drag operation
And the focus mode indicator should disappear
```

### Scenario 5: Column boundary scroll behavior in focus mode
**Description**: Product manager expects no accidental canvas movement when reaching content limits

```
Given that I am in focus mode viewing a conversation column
And the column content is scrolled to the very top or bottom
And my mouse cursor is still inside the column area

When I continue scrolling in the same direction (beyond the content boundary)

Then the column content should not scroll further
And the canvas should NOT move or pan
And the scroll action should be absorbed/ignored
And I should remain focused on reading without unexpected canvas movement
```

### Scenario 6: Shift+scroll behavior within column in focus mode
**Description**: Product manager expects all in-column scroll operations to be content-focused

```
Given that I am in focus mode viewing a conversation column
And my mouse cursor is positioned inside the column area

When I hold Shift and scroll with mouse wheel (horizontal scrolling attempt)

Then the scroll action should be treated as content-related operation
And the canvas should NOT pan horizontally
And the action should be absorbed/ignored to prevent accidental canvas movement
And I should remain focused on the column content without distraction
```

### Scenario 7: Focus mode re-entry mechanism
**Description**: Product manager needs clear way to return to focus mode after auto-exit

```
Given that I have exited focus mode (manually via ESC or automatically via blank area operations)
And there are conversation columns visible on the canvas
And I want to focus on reading a specific column

When I double-click on any column

Then I should enter focus mode for that column
And the column should be centered and optimally scaled for reading
And focus mode indicator should appear showing the active column
And keyboard navigation (arrow keys, ESC) should become available
And all focus mode protections should be activated for column content
```

### Scenario 8: Manual focus mode exit behavior
**Description**: Product manager needs reliable manual control over focus mode

```
Given that I am in focus mode viewing a conversation column
And I want to exit focus mode manually

When I press the ESC key

Then focus mode should exit immediately
And the canvas should remain at its current position and scale
And I should return to normal canvas navigation mode
And the focus mode indicator should disappear
And I can perform unrestricted canvas operations (pan, zoom, column selection)
```

### Scenario 9: Non-focused column interaction in focus mode
**Description**: Product manager expects selective protection - only the focused column should be protected, other columns remain interactive

```
Given that I am in focus mode viewing conversation column A
And there are other visible columns B and C on the canvas
And my mouse cursor is positioned over column B (non-focused column)

When I perform mouse operations on column B (scrolling, dragging, clicking)

Then focus mode should remain active for column A
And column A should maintain all focus mode protections (scroll priority, text selection, etc.)
And column B should behave as if in normal canvas mode (scroll triggers canvas panning)
And dragging from column B should pan the canvas normally
And the focus mode indicator should continue showing column A as focused
And I can switch focus to column B by double-clicking it
```

### Scenario 10: Focus scope and protection boundaries
**Description**: Product manager needs clear understanding of what is and isn't protected in focus mode

```
Given that I am in focus mode viewing conversation column A
And there are other columns B, C, and D visible on the canvas

When I interact with different areas of the interface

Then the protection scope should be clearly defined:
And PROTECTED: Column A content area (scrolling, text selection, input fields)
And PROTECTED: Column A drag operations (should not pan canvas)
And NOT PROTECTED: Column B, C, D content areas (scrolling pans canvas)
And NOT PROTECTED: Column B, C, D drag operations (should pan canvas)
And NOT PROTECTED: Blank canvas areas (normal canvas navigation)
And FOCUS SWITCHING: Double-clicking any other column switches focus to that column
And FOCUS EXITING: ESC key or blank area operations exit focus mode completely
```

### Scenario 11: Focus mode switching between columns
**Description**: Product manager expects smooth focus transfer between columns without exiting focus mode

```
Given that I am in focus mode viewing conversation column A
And there are other visible columns B and C on the canvas
And I want to focus on a different column while staying in focus mode

When I double-click on column B

Then focus mode should remain active (not exit)
And the focus should switch from column A to column B
And column B should immediately gain all focus mode protections
And column A should lose focus mode protections and return to normal behavior
And the focus mode indicator should update to show column B as the active focus
And the canvas should smoothly pan to center column B if needed
And column B should be optimally positioned for reading
```

---

## 📖 Focus Mode Interaction Principles

1. **Auto-exit on canvas intent**: Blank area operations automatically exit focus mode
2. **Selective column protection**: Only the focused column receives protection - other columns remain interactive
3. **Re-entry via double-click**: Easy return to focus mode on any column
4. **Focus switching**: Double-click other columns to switch focus without exiting focus mode
5. **Intent-based mode switching**: User actions clearly indicate desired interaction mode
6. **Seamless transitions**: Mode changes feel natural and predictable
7. **Reading-focused**: Focus mode optimizes for content consumption and navigation
8. **Scope clarity**: Clear boundaries between protected (focused column) and unprotected (other columns) areas