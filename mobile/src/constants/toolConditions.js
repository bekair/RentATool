import { ToolCondition } from '../generated/api-enums';

const TOOL_CONDITION_LABELS_MAP = {
    [ToolCondition.NEW]: 'New',
    [ToolCondition.LIKE_NEW]: 'Like new',
    [ToolCondition.GOOD]: 'Good',
    [ToolCondition.FAIR]: 'Fair',
    [ToolCondition.POOR]: 'Poor',
};

export const TOOL_CONDITION_OPTIONS = Object.values(ToolCondition).map((value) => ({
    value,
    label: TOOL_CONDITION_LABELS_MAP[value] || value,
}));

export const TOOL_CONDITION_LABELS = TOOL_CONDITION_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

export const getToolConditionLabel = (condition) => TOOL_CONDITION_LABELS[condition] || 'Not specified';

export const isValidToolCondition = (condition) =>
    TOOL_CONDITION_OPTIONS.some((option) => option.value === condition);
