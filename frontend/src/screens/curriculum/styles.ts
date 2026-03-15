import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#18181B',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  saveBtn: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Scroll
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingHorizontal: 24,
    gap: 16,
  },

  // Week Card
  weekCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  weekLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  weekBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekBadgeActive: {
    backgroundColor: '#8B5CF6',
  },
  weekBadgeInactive: {
    backgroundColor: '#3F3F46',
  },
  weekBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  weekTitleInput: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF6',
    paddingVertical: 2,
    minWidth: 100,
  },
  weekRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weekCount: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717A',
  },

  // Sessions Container
  sessionsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F1F23',
  },
  sessionInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    paddingHorizontal: 16,
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sessionNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
    minWidth: 40,
  },
  sessionTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
  },
  sessionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modeBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineBadge: {
    backgroundColor: '#22C55E20',
  },
  offlineBadge: {
    backgroundColor: '#F59E0B20',
  },
  deleteSessionBtn: {
    padding: 12,
    paddingRight: 16,
  },
  emptySession: {
    padding: 24,
    alignItems: 'center',
  },
  emptySessionText: {
    fontSize: 14,
    color: '#71717A',
  },

  // Add Session Button
  addSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#1F1F23',
  },
  addSessionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Delete Week Button
  deleteWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  deleteWeekText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#EF4444',
  },

  // Add Week Button
  addWeekBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF640',
    borderStyle: 'dashed',
  },
  addWeekText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // ==================== Session Edit Form ====================
  formContainer: {
    padding: 24,
    paddingTop: 16,
    gap: 24,
  },
  formSection: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  textareaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  textarea: {
    height: '100%',
    textAlignVertical: 'top',
  },
  inputText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  placeholderText: {
    color: '#71717A',
  },
  inputIcon: {
    marginRight: 12,
  },
  inputWithIcon: {
    paddingLeft: 0,
  },

  // Date & Time
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateInput: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timeInput: {
    width: 100,
    justifyContent: 'center',
  },

  // Mode Toggle
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 4,
    height: 48,
  },
  modeBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#8B5CF6',
  },
  modeBtnText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#71717A',
  },
  modeBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Note Section
  noteSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: '#27272A20',
    borderRadius: 12,
    padding: 16,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 20,
  },
});
