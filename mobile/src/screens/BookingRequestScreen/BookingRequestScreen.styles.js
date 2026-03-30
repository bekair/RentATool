import { StyleSheet } from 'react-native';

const C = {
  bg: "#0a0a0a",
  card: "#161616",
  cardAlt: "#1a1a1a",
  border: "#262626",
  text: "#fff",
  textMuted: "#888",
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.16)",
  danger: "#ef4444",
};


const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: C.bg,
  },
  header: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    backgroundColor: C.cardAlt,
  },
  headerBtn: {
    width: 28,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 36,
  },
  toolCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  toolName: {
    color: C.text,
    fontSize: 17,
    fontWeight: "700",
  },
  toolPrice: {
    marginTop: 4,
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  payLaterBanner: {
    backgroundColor: "rgba(99,102,241,0.08)",
    borderWidth: 1,
    borderColor: "rgba(99,102,241,0.35)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  payLaterText: {
    marginLeft: 8,
    color: "#c7c8ff",
    fontSize: 13,
    fontWeight: "600",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: C.text,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  calendar: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  legendRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#333",
    marginRight: 8,
  },
  legendText: {
    color: C.textMuted,
    fontSize: 12,
  },
  pickupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pickupChip: {
    minWidth: "47%",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: C.card,
  },
  pickupChipActive: {
    borderColor: C.accent,
    backgroundColor: C.accentSoft,
  },
  pickupChipText: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  pickupChipTextActive: {
    color: C.accent,
  },
  noteInput: {
    height: 128,
    paddingTop: 14,
    textAlignVertical: "top",
  },
  noteCounter: {
    marginTop: -12,
    color: C.textMuted,
    fontSize: 12,
    textAlign: "right",
  },
  summaryCard: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    padding: 16,
  },
  summaryTop: {
    color: C.textMuted,
    fontSize: 13,
    fontWeight: "600",
  },
  summaryAmount: {
    color: C.text,
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: C.danger,
    fontSize: 12,
    marginTop: 8,
    fontWeight: "500",
  },
});


export { C, styles };

