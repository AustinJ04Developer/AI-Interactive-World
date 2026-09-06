# EXHIBITION OPERATION & FLOOR GUIDE

This guide is designed for exhibition booth operators, teachers, and student volunteers managing the AI INTERACTIVE WORLD physical computer terminal.

---

## 🎯 Target Setup & Physical Terminal Specs
- **Display:** 1080p (1920×1080) or 1440p (2560×1440) widescreen monitor (16:9).
- **Peripherals:** Keyboard, mouse, standard HD webcam, and USB microphone.
- **Audio:** Speakers or headphones.
- **Browser:** Google Chrome or Microsoft Edge in Fullscreen kiosk mode (`F11`).

---

## ⌨️ Operator Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| **`F11`** | **Toggle Fullscreen** | Expands the browser window to fill the entire monitor. |
| **`M`** | **Mute / Unmute Audio** | Toggles synthesized procedural sound effects and voice. |
| **`Ctrl+Shift+D`** or **`~`** | **Presenter Demo Panel** | Secret drawer for judges and operators to jump to any experience instantly. |
| **`W A S D` + Mouse Drag** | **City Navigation** | Controls explorer movement in the Smart City 2050 3D world. |

---

## 🔄 Student Turnover Flow (Expo Mode)

### Automatic Turnover
- In **Expo Mode**, the terminal monitors visitor interaction.
- If the system remains idle for **45 seconds** (e.g. after a student walks away), it automatically clears the previous student's photo, resets score buffers, and returns to the Welcome screen ready for the next student in **under 15 seconds**.

### Manual Operator Reset
- If a student leaves mid-experience, press **`Ctrl+Shift+D`** and click **RESET CURRENT VISITOR**.

---

## 🛡️ Operator Console (`/operator`)
To access the real-time telemetry console:
1. Navigate to: `http://localhost:5173/operator` (or click `[OPERATOR CONSOLE]` on the landing screen).
2. Monitor real-time subsystem status:
   - 🟢 Database (MongoDB connection)
   - 🟢 AI Provider (Gemini / Neural Simulator)
   - 🟢 Hardware Sensors (Webcam and Mic permissions)
   - 🟢 QR Code Token Generator
3. View visitors count today and experience popularity breakdown.
4. Test AI reasoning or purge temporary snapshot cache.
