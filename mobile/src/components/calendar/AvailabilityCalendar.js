import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { useTheme, RESOLVED_THEMES } from '../../theme';

const EMPTY_SET = new Set();
const INVALID_DATE_ALERT_TITLE = 'Invalid Date';
const INVALID_DATE_ALERT_MESSAGE = 'You can only block dates within the next 3 weeks.';
const UNAVAILABLE_DATE_ALERT_TITLE = 'Unavailable Date';
const UNAVAILABLE_DATE_ALERT_MESSAGE = 'This date is unavailable.';
const INVALID_RANGE_ALERT_TITLE = 'Invalid Range';
const INVALID_RANGE_ALERT_MESSAGE = 'Your selection includes unavailable dates.';

const toIsoDate = (date) => date.toISOString().split('T')[0];

const addUtcDays = (isoDateString, days) => {
    const date = new Date(`${isoDateString}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return toIsoDate(date);
};

export default function AvailabilityCalendar({
    mode = 'block',
    manualBlockedDates = EMPTY_SET,
    onManualBlockedDatesChange = () => { },
    selectionStart = null,
    onSelectionStartChange = () => { },
    rangeStart = null,
    rangeEnd = null,
    onRangeStartChange = () => { },
    onRangeEndChange = () => { },
    unavailableDates = EMPTY_SET,
    readOnly = false,
    resetSelectionToPressedOnInvalidRange = false,
}) {
    const { theme } = useTheme();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const todayString = toIsoDate(new Date());
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 21);
    const maxDateString = toIsoDate(maxDateObj);
    const minMonthKey = todayString.slice(0, 7);
    const maxMonthKey = maxDateString.slice(0, 7);
    const [displayedMonth, setDisplayedMonth] = useState(minMonthKey);

    const resolvedCalendarBackground =
        theme.id === RESOLVED_THEMES.LIGHT ? theme.colors.fieldEditingBg : theme.colors.bg;

    const markedDates = useMemo(() => {
        const marks = {};

        if (mode === 'block') {
            manualBlockedDates.forEach((date) => {
                const prevStr = addUtcDays(date, -1);
                const nextStr = addUtcDays(date, 1);

                marks[date] = {
                    color: theme.colors.accent,
                    textColor: theme.colors.accentContrast,
                    startingDay: !manualBlockedDates.has(prevStr),
                    endingDay: !manualBlockedDates.has(nextStr),
                };
            });
        }

        unavailableDates.forEach((date) => {
            marks[date] = {
                ...marks[date],
                startingDay: true,
                endingDay: true,
                color: theme.colors.danger,
                textColor: theme.colors.accentContrast,
                disableTouchEvent: true,
            };
        });

        if (!readOnly && mode === 'block' && selectionStart) {
            const prevStr = addUtcDays(selectionStart, -1);
            const nextStr = addUtcDays(selectionStart, 1);

            marks[selectionStart] = {
                ...marks[selectionStart],
                startingDay: !manualBlockedDates.has(prevStr),
                endingDay: !manualBlockedDates.has(nextStr),
                color: theme.colors.accent,
                textColor: theme.colors.accentContrast,
            };
        }

        if (mode === 'range' && rangeStart) {
            marks[rangeStart] = {
                ...marks[rangeStart],
                startingDay: true,
                endingDay: !rangeEnd,
                color: theme.colors.accent,
                textColor: theme.colors.accentContrast,
            };
        }

        if (mode === 'range' && rangeStart && rangeEnd) {
            marks[rangeEnd] = {
                ...marks[rangeEnd],
                endingDay: true,
                color: theme.colors.accent,
                textColor: theme.colors.accentContrast,
            };

            let cursor = addUtcDays(rangeStart, 1);
            while (cursor < rangeEnd) {
                marks[cursor] = {
                    ...marks[cursor],
                    color: theme.colors.accent,
                    textColor: theme.colors.accentContrast,
                    startingDay: false,
                    endingDay: false,
                };
                cursor = addUtcDays(cursor, 1);
            }
        }

        return marks;
    }, [
        mode,
        manualBlockedDates,
        selectionStart,
        rangeStart,
        rangeEnd,
        readOnly,
        unavailableDates,
        theme.colors.accent,
        theme.colors.accentContrast,
        theme.colors.danger,
    ]);

    const isRangeValid = (start, end) => {
        let cursor = start;
        while (cursor <= end) {
            if (unavailableDates.has(cursor)) {
                return false;
            }
            cursor = addUtcDays(cursor, 1);
        }
        return true;
    };

    const handleDayPress = (day) => {
        const dateString = day.dateString;

        if (unavailableDates.has(dateString)) {
            Alert.alert(UNAVAILABLE_DATE_ALERT_TITLE, UNAVAILABLE_DATE_ALERT_MESSAGE);
            return;
        }

        if (dateString < todayString || dateString > maxDateString) {
            Alert.alert(INVALID_DATE_ALERT_TITLE, INVALID_DATE_ALERT_MESSAGE);
            return;
        }

        if (mode === 'range') {
            if (!rangeStart || rangeEnd) {
                onRangeStartChange(dateString);
                onRangeEndChange(null);
                return;
            }

            if (dateString < rangeStart) {
                onRangeStartChange(dateString);
                onRangeEndChange(null);
                return;
            }

            if (!isRangeValid(rangeStart, dateString)) {
                Alert.alert(INVALID_RANGE_ALERT_TITLE, INVALID_RANGE_ALERT_MESSAGE);
                onRangeStartChange(
                    resetSelectionToPressedOnInvalidRange ? dateString : null,
                );
                onRangeEndChange(null);
                return;
            }

            onRangeEndChange(dateString);
            return;
        }

        if (manualBlockedDates.has(dateString)) {
            const next = new Set(manualBlockedDates);
            next.delete(dateString);
            onManualBlockedDatesChange(next);
            onSelectionStartChange(null);
            return;
        }

        if (!selectionStart) {
            onSelectionStartChange(dateString);
            return;
        }

        if (dateString < selectionStart) {
            onSelectionStartChange(dateString);
            return;
        }

        const next = new Set(manualBlockedDates);
        let cursor = selectionStart;
        let hasCollision = false;

        while (cursor <= dateString) {
            if (unavailableDates.has(cursor)) {
                hasCollision = true;
                break;
            }
            next.add(cursor);
            cursor = addUtcDays(cursor, 1);
        }

        if (hasCollision) {
            Alert.alert(INVALID_RANGE_ALERT_TITLE, INVALID_RANGE_ALERT_MESSAGE);
            onSelectionStartChange(resetSelectionToPressedOnInvalidRange ? dateString : null);
            return;
        }

        onManualBlockedDatesChange(next);
        onSelectionStartChange(null);
    };

    return (
        <Calendar
            style={styles.calendar}
            theme={{
                backgroundColor: resolvedCalendarBackground,
                calendarBackground: resolvedCalendarBackground,
                textSectionTitleColor: theme.colors.iconMuted,
                todayTextColor: theme.colors.accent,
                dayTextColor: theme.colors.textPrimary,
                textDisabledColor: theme.colors.borderStrong,
                arrowColor: theme.colors.accent,
                monthTextColor: theme.colors.textPrimary,
            }}
            markingType="period"
            onDayPress={readOnly ? undefined : handleDayPress}
            markedDates={markedDates}
            disableArrowLeft={displayedMonth === minMonthKey}
            disableArrowRight={displayedMonth === maxMonthKey}
            onMonthChange={(month) => setDisplayedMonth(month.dateString.slice(0, 7))}
            minDate={todayString}
            maxDate={maxDateString}
        />
    );
}

const createStyles = (theme) =>
    StyleSheet.create({
        calendar: {
            borderWidth: 1,
            borderColor: theme.id === RESOLVED_THEMES.LIGHT
                ? theme.colors.fieldEditingBorder
                : theme.colors.border,
            borderRadius: 12,
            overflow: 'hidden',
            ...(theme.id === RESOLVED_THEMES.LIGHT && {
                shadowColor: theme.colors.inputShadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 10,
                elevation: 4,
            }),
        },
    });
