import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#1a1a1a',
    },
    headerRightSpacer: {
        width: 40,
    },
    toolInfo: {
        padding: 20,
    },
    toolName: {
        fontSize: 22,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 8,
    },
    instructions: {
        fontSize: 14,
        color: '#888',
        lineHeight: 20,
    },
    legendContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        paddingBottom: 16,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 16,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 6,
    },
    legendText: {
        color: '#888',
        fontSize: 12,
    },
    calendar: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: '#1a1a1a',
    },
    footer: {
        padding: 20,
        marginTop: 'auto',
    },
    saveButton: {
        backgroundColor: '#6366f1',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#333',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default styles;
