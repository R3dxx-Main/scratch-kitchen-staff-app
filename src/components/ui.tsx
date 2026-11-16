import React from 'react';
import { Pressable, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { colors, fonts, TAP } from '../theme';
import { CheckIcon } from './icons';

export function H1({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityRole="header" style={[s.h1, style]}>
      {children}
    </Text>
  );
}

export function H2({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text accessibilityRole="header" style={[s.h2, style]}>
      {children}
    </Text>
  );
}

export function Crumb({ children }: { children: React.ReactNode }) {
  return <Text style={s.crumb}>{children}</Text>;
}

export function Intro({ children }: { children: React.ReactNode }) {
  return <Text style={s.intro}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.muted, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[s.body, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

type ButtonVariant = 'primary' | 'dark' | 'outline' | 'outlineDark' | 'danger';

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  icon,
  style,
  big,
  accessibilityLabel,
}: {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  big?: boolean;
  accessibilityLabel?: string;
}) {
  const v = disabled ? s.btnDisabled : s[`btn_${variant}`];
  const t = disabled ? s.btnTextDisabled : s[`btnText_${variant}`];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.btn, big && { minHeight: 56 }, v, pressed && !disabled && { opacity: 0.8 }, style]}
    >
      {icon}
      <Text style={[s.btnText, t]}>{label}</Text>
    </Pressable>
  );
}

/** A row of choices where one is picked, red when selected, like the website. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
  stretch,
  wrap,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  stretch?: boolean;
  wrap?: boolean;
}) {
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel={label} style={[s.segRow, wrap && { flexWrap: 'wrap' }]}>
      {options.map((o) => {
        const on = o === value;
        return (
          <Pressable
            key={o}
            accessibilityRole="radio"
            accessibilityState={{ selected: on, checked: on }}
            onPress={() => onChange(o)}
            style={[s.pill, stretch && { flex: 1 }, on ? s.pillOn : s.pillOff]}
          >
            <Text style={[s.pillText, { color: on ? colors.white : colors.ink }]}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Badge({ label, bg, fg, outline }: { label: string; bg?: string; fg?: string; outline?: boolean }) {
  return (
    <View style={[s.badge, outline ? { borderWidth: 1, borderColor: colors.ink } : { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color: fg ?? colors.ink }]}>{label}</Text>
    </View>
  );
}

export function Field({ label, hideLabel, style, ...props }: TextInputProps & { label: string; hideLabel?: boolean; style?: StyleProp<TextStyle> }) {
  return (
    <View style={{ gap: 4 }}>
      {!hideLabel && <Text style={s.label}>{label}</Text>}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#8A7F7A"
        style={[s.input, props.multiline && { height: 96, paddingTop: 12, textAlignVertical: 'top' }, style]}
        {...props}
      />
    </View>
  );
}

export function Label({ children }: { children: React.ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}

/** − count + with large buttons. */
export function Stepper({ value, onMinus, onPlus, name, size = TAP }: { value: number | string; onMinus: () => void; onPlus: () => void; name: string; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={`One less ${name}`} onPress={onMinus} style={[s.step, { width: size, height: size }]}>
        <Text style={s.stepText}>−</Text>
      </Pressable>
      <Text accessibilityLiveRegion="polite" style={s.stepValue}>
        {value}
      </Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`One more ${name}`} onPress={onPlus} style={[s.step, { width: size, height: size }]}>
        <Text style={s.stepText}>+</Text>
      </Pressable>
    </View>
  );
}

export function CheckBox({ checked, onPress, label, size = 28 }: { checked: boolean; onPress: () => void; label: string; size?: number }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked }}
      onPress={onPress}
      hitSlop={10}
      style={[s.check, { width: size, height: size }, checked ? { backgroundColor: colors.red, borderColor: colors.red } : null]}
    >
      {checked && <CheckIcon size={size * 0.7} />}
    </Pressable>
  );
}

export function Notice({ text, tone = 'ok' }: { text: string; tone?: 'ok' | 'warn' }) {
  return (
    <Text accessibilityLiveRegion="polite" style={[s.notice, { color: tone === 'ok' ? colors.successText : colors.redDark }]}>
      {text}
    </Text>
  );
}

export const s = StyleSheet.create({
  h1: { fontFamily: fonts.display, fontSize: 30, lineHeight: 36, color: colors.ink, marginBottom: 4 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28, color: colors.ink },
  crumb: { fontFamily: fonts.regular, fontSize: 14, color: colors.muted, marginBottom: 2 },
  intro: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22, color: colors.muted, marginBottom: 18 },
  muted: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20, color: colors.muted },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 23, color: colors.ink },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  btn: { minHeight: 52, paddingHorizontal: 22, borderRadius: 999, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { fontFamily: fonts.semibold, fontSize: 16 },
  btn_primary: { backgroundColor: colors.red },
  btnText_primary: { color: colors.white },
  btn_dark: { backgroundColor: colors.ink },
  btnText_dark: { color: colors.white },
  btn_outline: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.inputBorder },
  btnText_outline: { color: colors.ink },
  btn_outlineDark: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.ink },
  btnText_outlineDark: { color: colors.ink },
  btn_danger: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.redDark },
  btnText_danger: { color: colors.redDark },
  btnDisabled: { backgroundColor: colors.disabledBg },
  btnTextDisabled: { color: colors.disabledText },
  segRow: { flexDirection: 'row', gap: 8 },
  pill: { minHeight: TAP, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillOn: { backgroundColor: colors.red, borderColor: colors.red },
  pillOff: { backgroundColor: colors.white, borderColor: colors.inputBorder },
  pillText: { fontFamily: fonts.semibold, fontSize: 15 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontFamily: fonts.semibold, fontSize: 12 },
  label: { fontFamily: fonts.semibold, fontSize: 13, color: colors.ink },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
    color: colors.ink,
    fontFamily: fonts.regular,
    fontSize: 16,
  },
  step: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 24, lineHeight: 28, color: colors.ink, fontFamily: fonts.medium },
  stepValue: { minWidth: 34, textAlign: 'center', fontFamily: fonts.bold, fontSize: 17, color: colors.ink },
  check: { borderWidth: 2.5, borderColor: colors.ink, borderRadius: 8, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
  notice: { fontFamily: fonts.semibold, fontSize: 14, marginVertical: 8 },
});
