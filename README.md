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

## Data

This version runs on **sample data** (the same sample data as the Staff Hub website) kept in memory, so changes reset when the app restarts. All data goes through one file, `src/data/store.tsx`. Connecting a shared database (Supabase, Firebase or the Staff Hub's own backend) means changing that file only, not the screens.

## Try it on a phone

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
src/data/             types, sample data, store
src/lib/              dates; report building, printing, PDF and CSV
assets/               logo, app icon, splash
```

## Checks

```bash
npm run typecheck
npx expo export --platform android   # or ios / web
```
