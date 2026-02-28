import { StyleSheet } from 'react-native';

// ─── Styles (design.pen 기준) ─────────────────────────────────────────────────

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 28,
    paddingBottom: 16,
  },

  // Header (design.pen 기준)
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 32,
  },
  backBtn: {
    width: 40,
    height: 40,
    backgroundColor: '#27272A',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
  },

  // Title Section
  titleSection: {
    marginBottom: 32,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: '#71717A',
  },

  // Step content
  stepContent: {
    flex: 1,
  },
  stepContentInner: {
    paddingBottom: 20,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Buttons
  buttons: {
    gap: 12,
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  skipBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipBtnText: {
    fontSize: 15,
    color: '#71717A',
  },

  // ─── Step 1: Terms ───────────────────────────────────────────────────
  termsAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
    height: 56,
  },
  termsAllText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  termsLabelRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  termsRequiredBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  termsOptionalBadge: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
  },
  termsText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3F3F46',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },

  // ─── Step 2: Experience (design.pen 기준) ──────────────────────────────
  experienceList: {
    gap: 12,
  },
  optionCard: {
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  optionCardSelected: {
    backgroundColor: '#8B5CF6',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  optionTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 3: Interests (design.pen: chip 형태) ─────────────────────────
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  chipTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 4: Study Style (design.pen 기준) ─────────────────────────────
  studyStyleList: {
    gap: 12,
  },
  studyStyleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  studyStyleCardSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  studyStyleText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  studyStyleTextSelected: {
    fontWeight: '600',
  },

  // ─── Step 5: Region (design.pen 기준) ──────────────────────────────────
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  gpsBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  regionList: {
    gap: 8,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  regionItemSelected: {
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  regionItemText: {
    fontSize: 15,
    color: '#FFFFFF',
    flex: 1,
  },
  regionItemTextSelected: {
    fontWeight: '600',
  },
  regionItemCheck: {
    marginLeft: 'auto',
  },
  regionEmpty: {
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  regionEmptyText: {
    fontSize: 14,
    color: '#52525B',
  },
  searchContainerActive: {
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  gpsBtnLoading: {
    opacity: 0.7,
  },
  gpsResultBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  gpsResultText: {
    fontSize: 13,
    color: '#8B5CF6',
  },

  // ─── Step 6: Profile (design.pen 기준) ─────────────────────────────────
  profileContainer: {
    alignItems: 'center',
    gap: 24,
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: '#8B5CF6',
  },
  inputContainer: {
    width: '100%',
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  inputWrapper: {
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    justifyContent: 'center',
  },
  input: {
    height: '100%',
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },

  // ─── Step 7: Complete (design.pen 기준) ────────────────────────────────
  completeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingBottom: 40,
    gap: 24,
  },
  completeIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completeTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  completeSubtitle: {
    fontSize: 15,
    color: '#71717A',
    textAlign: 'center',
  },
  completeBtn: {
    width: '100%',
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  completeBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
