export const TOOL_CONDITION_OPTIONS = [
    { value: 'NEW', label: 'New' },
    { value: 'LIKE_NEW', label: 'Like new' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' },
];

export const TOOL_CONDITION_LABELS = TOOL_CONDITION_OPTIONS.reduce((acc, option) => {
    acc[option.value] = option.label;
    return acc;
}, {});

export const getToolConditionLabel = (condition) => TOOL_CONDITION_LABELS[condition] || 'Not specified';

export const isValidToolCondition = (condition) =>
    TOOL_CONDITION_OPTIONS.some((option) => option.value === condition);
