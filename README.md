# Scratch Kitchen Staff app

The phone and tablet companion to the Scratch Kitchen Staff Hub website, for iPhone, iPad and Android. It is built with [Expo](https://expo.dev) (React Native) and matches the Staff Hub's branding: red `#D4202A`, dark `#2A2323`, cream `#FAF6F3`, Fraunces and Inter.

## What's in this version

| Section | What staff can do |
| --- | --- |
| **Home** | Logo, open orders and items needed at a glance, **Team messages** with Send to team |
| **Orders** | Order board filtered by All / Catering / Bakery, stage buttons (Start prep → Mark ready → Mark picked up), Add an order, Edit order, repeating orders with Skip this day, Restore this day and Stop repeating, choose a customer from the list or type a new one |
| **Production** | **Items needed** (shopping and supply list, add from inventory) and **Inventory** (+/− counts, cost per unit, value on hand, Send to Main Production or Second Shift Production, Add to items needed) |
| **Customers** | Customer list with email, phone, address and notes; add, edit and delete |
| **Outputs** | **End of day** reports: generate, **Print**, **PDF** and **CSV** per report, Print selected, Download PDFs, add or edit reports |
| **Menu** | Every Staff Hub section; ones not in the app yet are marked Coming soon |

On a **tablet held sideways** (900 points wide or more) the app switches to the website's layout: a dark icon rail on the left, and Orders with the Add/Edit form beside the board.

Printing uses the phone's own print screen (AirPrint on iPhone and iPad, the print service on Android), so staff use the printers they already have set up. PDF and CSV open the share sheet, where they can be saved to Files, emailed or sent.

## Data and staff sign-in

All data lives in the shared **Supabase** database (project `scratch-kitchen-staff-app`), so every phone and tablet sees the same orders, items, inventory, customers, messages and reports. Changes appear on other devices within a second or two.

- **Staff accounts:** public sign-up is turned off. To add someone, open the Supabase dashboard → **Authentication** → **Users** → **Add user** → **Create new user**, enter their email and a password, tick **Auto Confirm User**, and give them those details. To show their name on Team messages, add `{"name": "Their Name"}` under the user's metadata; otherwise the part of their email before the @ is used.
- **Security:** every table can only be read or changed by signed-in staff (row level security). The publishable key in `src/lib/supabase.ts` is designed to be inside the app.
- **Database setup:** `supabase/setup.sql` creates the tables, security rules and starting data. It has already been run; it is safe to run again.
- **Code:** all data goes through `src/data/store.tsx`; sign-in is `src/data/auth.tsx`.

## Try it on a phone (Windows, no typing)

1. On this GitHub page click the green **Code** button → **Download ZIP**, then right-click the downloaded file → **Extract All**.
2. Install **Expo Go** on your phone from the App Store or Google Play.
3. In the extracted folder, double-click **`Start Scratch Kitchen App.bat`**. The first time it installs packages for a few minutes.
4. When the QR code appears, scan it: on iPhone with the Camera app, on Android inside Expo Go. If Windows asks about network access, click **Allow**.

If the phone can't connect (different Wi-Fi, or a work network), close that window and double-click **`Start (if phone cannot connect).bat`** instead. To see the app in a browser, use **`Open in web browser.bat`**.

## Try it on a phone (any computer, with a terminal)

1. Install **Node.js 20+** on your computer.
2. In this folder run:
   ```bash
   npm install
   npx expo start
   ```
3. Install **Expo Go** from the App Store or Google Play, then scan the QR code shown in the terminal. The phone and computer must be on the same Wi-Fi.

Run `npx expo start --web` to open it in a browser.

## Build for the App Store and Google Play

The app is set up for [EAS Build](https://docs.expo.dev/build/introduction/), Expo's cloud build service, so no Xcode or Android Studio is needed:

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest build --platform all
```

Publishing needs an Apple Developer account ($99/year) and a Google Play developer account ($25 once). The app ids are `com.scratchkitchen.staff` on both platforms. Change them in `app.json` before the first store build if you want different ones.

## Project layout

```
src/app/              screens (Expo Router: each file is a screen)
  index.tsx           Home and Team messages
  orders/             board, add/edit form, choose a customer
  needs/              items needed, add an item
  inventory.tsx
  customers/          list, add/edit
  outputs/            end of day, print
  menu.tsx, support.tsx
src/components/       app frame (top bar, section menu, bottom bar / side rail), order card and form, buttons and inputs, icons
src/data/             types, staff sign-in, live data store
src/lib/              Supabase connection, dates, report building, printing, PDF and CSV
supabase/setup.sql    database tables, security rules and starting data
assets/               logo, app icon, splash
```

## Checks

```bash
npm run typecheck
npx expo export --platform android   # or ios / web
```
