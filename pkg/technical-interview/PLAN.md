# Technical Interview - Implementation Plan

## Target File

`pkg/technical-interview/pages/tab-page.vue` — using existing `Tabbed` + `Tab` components.

## Tab 1: Counter + Popover

1. Show a button that **decrements** a counter (initial value: **42**)
2. On hover **> 250ms**, display a popover:
   - Size: **300px × 100px**
   - Position: next to the button, as close as possible to cursor, with **16px** horizontal & vertical gap between button and popover
   - Content: current counter value + a **"reset everything to default"** link
   - Clicking the link resets everything to default and hides the popover
3. Popover disappears when the user stops hovering **both** the button and the popover

## Tab 2: Date & Time

1. Display **current date and time** (to the minute)
2. Provide inputs for **seconds / minutes / hours** to produce an **updated date and time**
3. Compare and inform the user whether current time is **before / same / after** the updated time

## Tab 3: JSON Key-Value Swap

1. Prompt user to **upload a JSON file**
2. Display file contents
3. Provide a button to **swap primitive values and keys**
   - `{ "a": 1 }` → `{ 1: "a" }`
   - `{ "b": {}, "c": [] }` → unchanged (non-primitive values are not swapped)
4. Display the swapped result

## Tab 4: Coin Change (Minimum Coins)

1. User inputs a **coin denominations array** and a **target amount**
2. Compute the **minimum set of coins** that matches the amount, or return `null`
3. Examples:
   - `coins=[1,2,5], amount=11` → `[5,5,1]`
   - `coins=[2], amount=3` → `null`
   - `coins=[1], amount=0` → `[]`

## AI Disclosure

AI (Claude Code) was used to assist with planning and implementation. This will be discussed during the interview.

---

## Implementation Notes & Discussion Log

### Tab 1: Counter + Popover

**Approach:**
- Read the existing `Tabbed` (`shell/components/Tabbed/index.vue`) and `Tab` (`shell/components/Tabbed/Tab.vue`) components to understand their props/slots API before coding.
- Used Options API (`defineComponent`) to match the existing scaffold in `tab-page.vue`.

**Design decisions:**
- **Popover positioning**: Uses `fixed` positioning based on `MouseEvent` coordinates. The popover direction is determined by the **closest button edge to the cursor** — it tries right → left → bottom → top, skipping any direction where the popover would overflow the viewport. The popover is then clamped to stay within screen bounds. This approach was chosen over the project's existing `v-dropdown` (floating-vue) and `fitOnScreen()` utilities because the requirement demands the popover **follow the cursor**, not anchor to a fixed element position.
- **Why not use existing utilities**: `v-dropdown` and `v-clean-tooltip` anchor popovers to the trigger element at a fixed placement. The spec requires the popover to track the mouse cursor position, so custom positioning logic was necessary.
- **Hover delay**: `setTimeout(250ms)` on `mouseenter`; cleared on `mouseleave` to prevent flash on quick hover.
- **Hover persistence**: Both button and popover track hover state (`isHoveringBtn`, `isHoveringPop`). A 50ms debounce in `hidePopoverIfNeeded()` allows the cursor to travel from button to popover without closing it.
- **Reset**: Resets counter to `INITIAL_COUNTER` (42) and forces popover closed.
- **Styling**: Uses project CSS variables (`--body-bg`, `--border`, `--shadow`, `--link`) for theme consistency.
- **Composable extraction**: Extracted hover + popover logic into `composables/useHoverPopover.ts`. Chose composable over directive because it needs to manage multiple reactive states (timer, hover flags, popover position/visibility) and return event handler objects. The composable exposes `triggerEvents` and `popoverEvents` objects that can be bound via `v-on`, keeping `CounterTab.vue` focused on business logic only.
- **Component separation**: Each tab is its own component under `components/` to keep `tab-page.vue` clean and each tab's data/methods isolated.

### Tab 2: Date & Time

**Approach:**
- Current time updates every second via `setInterval`, displayed to the minute.
- User inputs hours/minutes/seconds as offsets to add to the current time, producing an "updated" datetime.
- Comparison is computed reactively — automatically updates as the clock ticks or inputs change.

**Design decisions:**
- **Offset-based adjustment**: User supplies hours/minutes/seconds to add (can be negative). This felt more intuitive than requiring an absolute datetime picker, and matches the spec wording "updated by supplying seconds, minutes and/or hours".
- **Updated display includes seconds**: Since the user can supply seconds, the updated time shows seconds too, while the current time only shows to the minute (per spec).
- **Timer cleanup**: `setInterval` is cleared in `onBeforeUnmount` to prevent memory leaks.
- **dayjs**: Replaced hand-written `formatDateTime` with `dayjs` — the project already uses `dayjs` across 30+ files (e.g. `shell/components/formatter/Date.vue`). Keeps date formatting consistent with the codebase.
- **visibilitychange**: Added `document.visibilitychange` listener to immediately refresh the clock when the browser tab regains focus, preventing stale display after background throttling. This pattern is already used in the project (`shell/mixins/browser-tab-visibility.js`, `shell/components/Inactivity.vue`).

### Tab 3: JSON Key-Value Swap

**Approach:**
- User uploads a `.json` file via the project's existing `FileSelector` component (`shell/components/form/FileSelector.vue`), which handles `FileReader` internally and emits the file content as a string.
- Display parsed JSON, then on button click show the swapped result.

**Design decisions:**
- **Swap logic**: Only swaps entries where the value is primitive (`string | number | boolean | null`). Non-primitive values (objects, arrays) keep their original key. This matches the spec examples (`{ "b": {}, "c": [] }` unchanged).
- **Validation**: Rejects non-object JSON (arrays, primitives) with an error message, since key-value swapping only makes sense on objects.
- **Lazy swap**: Swapped result is a `computed` but only shown after clicking the button, so the user sees original content first.
