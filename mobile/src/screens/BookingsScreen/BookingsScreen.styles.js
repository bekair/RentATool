import { StyleSheet } from 'react-native';

const C = {
  bg: "#0a0a0a",
  card: "#161616",
  border: "#262626",
  text: "#fff",
  muted: "#888",
  accent: "#6366f1",
  success: "#22c55e",
  danger: "#ef4444",
  warning: "#f59e0b",
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  topLoader: {
    paddingVertical: 10,
    alignItems: "center",
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 20,
  },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 4,
    height: 44,
  },
  segment: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  activeSegment: {
    backgroundColor: "#333",
  },
  segmentText: {
    color: C.muted,
    fontWeight: "600",
    fontSize: 14,
  },
  activeSegmentText: {
    color: C.text,
    fontWeight: "bold",
  },
  listContainer: {
    padding: 20,
    paddingTop: 10,
    paddingBottom: 100,
    flexGrow: 1,
  },
  card: {
    backgroundColor: C.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: C.border,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  toolIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(99,102,241,0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  toolName: {
    fontSize: 16,
    fontWeight: "bold",
    color: C.text,
    marginBottom: 4,
  },
  otherParty: {
    fontSize: 12,
    color: C.muted,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    maxWidth: 130,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 16,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  dateInfo: {
    alignItems: "center",
  },
  dateArrow: {
    paddingHorizontal: 10,
  },
  dateLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  dateValue: {
    fontSize: 13,
    color: "#ccc",
    fontWeight: "500",
  },
  priceInfo: {
    alignItems: "flex-end",
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    paddingLeft: 16,
  },
  priceLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 2,
    textTransform: "uppercase",
  },
  priceValue: {
    fontSize: 16,
    color: C.accent,
    fontWeight: "bold",
  },
  metaSection: {
    marginBottom: 10,
  },
  metaLabel: {
    color: C.muted,
    fontSize: 11,
    textTransform: "uppercase",
    marginBottom: 2,
    letterSpacing: 0.4,
  },
  metaValue: {
    color: C.text,
    fontSize: 14,
    fontWeight: "600",
  },
  metaNote: {
    color: "#cfcfcf",
    fontSize: 13,
    lineHeight: 19,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: C.success,
  },
  rejectButton: {
    backgroundColor: "rgba(239,68,68,0.1)",
    borderWidth: 1,
    borderColor: C.danger,
  },
  approveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  rejectButtonText: {
    color: C.danger,
    fontWeight: "bold",
    fontSize: 14,
  },
  cancelLink: {
    alignSelf: "center",
    paddingVertical: 8,
    marginTop: 4,
  },
  cancelLinkText: {
    color: "#9d9d9d",
    fontSize: 12,
    textDecorationLine: "underline",
  },
  payNowButton: {
    marginTop: 10,
  },
  emptyContainer: {
    marginTop: 60,
    alignItems: "center",
    padding: 40,
    flex: 1,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: C.text,
    marginTop: 10,
    marginBottom: 8,
  },
  emptyText: {
    color: C.muted,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});

export { C, styles };
