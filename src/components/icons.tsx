// The Staff Hub website's own section icons.
import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

type P = { size?: number; color?: string; bg?: string };

export function HomeIcon({ size = 24, color = colors.railIcon }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 12l9-8 9 8v8h-6v-6H9v6H3z" fill={color} />
    </Svg>
  );
}

export function OrdersIcon({ size = 24, color = colors.railIcon }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 5h9M5 5v14h14v-9" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" />
      <Path d="M10 15l1-4 8-8 3 3-8 8z" fill={color} />
    </Svg>
  );
}

export function CustomersIcon({ size = 24, color = colors.railIcon }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={9} cy={8} r={4} fill={color} />
      <Circle cx={17} cy={9} r={3} fill={color} />
      <Path d="M2 20c0-4 3-7 7-7s7 3 7 7zM15 20c0-2 1-5 4-5s4 3 4 5z" fill={color} />
    </Svg>
  );
}

export function ProductionIcon({ size = 24, color = colors.railIcon }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 11h14v9H5zM7 11V8M12 11V6M17 11V8" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function OutputsIcon({ size = 24, color = colors.railIcon, bg = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 9V4h10v5" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={3} y={9} width={18} height={9} rx={2} fill={color} />
      <Rect x={7} y={14} width={10} height={6} fill={bg} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function MenuIcon({ size = 24, color = colors.railIcon }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h16M4 12h16M4 17h16" stroke={color} strokeWidth={2.2} strokeLinecap="round" />
    </Svg>
  );
}

export function PrintIcon({ size = 20, color = colors.ink, bg = colors.white }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 9V4h10v5" fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" />
      <Rect x={3} y={9} width={18} height={9} rx={2} fill="none" stroke={color} strokeWidth={2} />
      <Rect x={7} y={14} width={10} height={6} fill={bg} stroke={color} strokeWidth={2} />
    </Svg>
  );
}

export function DownloadIcon({ size = 16, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16">
      <Path d="M8 2v8M4.5 7L8 10.5 11.5 7M3 13.5h10" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function BackIcon({ size = 22, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5l-7 7 7 7" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronIcon({ size = 20, color = colors.ink }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 5l7 7-7 7" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function PlusIcon({ size = 20, color = colors.white }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 5v14M5 12h14" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 18, color = colors.white }: P) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
