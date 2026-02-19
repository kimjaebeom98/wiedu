import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 28,
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
  stepLabel: {
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
    minWidth: 28,
    textAlign: 'right',
  },

  // Title Section
  titleSection: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    color: '#71717A',
  },

  // Step scroll
  stepContent: {
    flex: 1,
  },
  stepContentInner: {
    paddingBottom: 16,
  },
  stepInner: {
    gap: 20,
  },

  // Field
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  required: {
    color: '#8B5CF6',
  },
  fieldHint: {
    fontWeight: '400',
    color: '#52525B',
  },
  fieldHintText: {
    fontSize: 12,
    color: '#52525B',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#52525B',
    textAlign: 'right',
  },
  charCountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  minCharHint: {
    fontSize: 12,
    color: '#EF4444',
  },
  minCharHintValid: {
    color: '#22C55E',
  },

  // Text Inputs
  textInput: {
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  textArea: {
    height: 120,
    paddingTop: 14,
    paddingBottom: 14,
  },
  textAreaSmall: {
    height: 88,
    paddingTop: 14,
    paddingBottom: 14,
  },

  // Category
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  categoryChipSelected: {
    backgroundColor: '#8B5CF6',
  },
  categoryChipIcon: {
    fontSize: 14,
  },
  categoryChipText: {
    fontSize: 14,
    color: '#D4D4D8',
  },
  categoryChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Image Upload
  imageUploadBtn: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#27272A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageUploadPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#3F3F46',
    borderStyle: 'dashed',
    borderRadius: 12,
  },
  imageUploadText: {
    fontSize: 14,
    color: '#52525B',
  },
  imagePreviewContainer: {
    flex: 1,
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Chips
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: '#27272A',
    borderRadius: 100,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  chipSelected: {
    backgroundColor: '#8B5CF6',
  },
  chipText: {
    fontSize: 14,
    color: '#D4D4D8',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // Tags
  tagInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tagInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#FFFFFF',
  },
  tagAddBtn: {
    width: 48,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagAddBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 100,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
  },
  tagBadgeText: {
    fontSize: 13,
    color: '#A78BFA',
    fontWeight: '500',
  },

  // Study Method
  methodList: {
    gap: 10,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 18,
    gap: 12,
  },
  methodCardSelected: {
    backgroundColor: '#8B5CF6',
  },
  methodText: {
    fontSize: 15,
    color: '#FFFFFF',
  },
  methodTextSelected: {
    fontWeight: '600',
  },

  // Days
  dayRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#27272A',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayBtnSelected: {
    backgroundColor: '#8B5CF6',
  },
  dayBtnText: {
    fontSize: 14,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  dayBtnTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Time Picker
  timePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  timePickerText: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
  },
  timePickerPlaceholder: {
    color: '#52525B',
  },
  timePickerContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  timePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  timePickerDone: {
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Duration Slider
  durationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B5CF6',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderMinLabel: {
    fontSize: 12,
    color: '#71717A',
    minWidth: 28,
  },
  sliderMaxLabel: {
    fontSize: 12,
    color: '#71717A',
    minWidth: 28,
    textAlign: 'right',
  },
  sliderTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 36,
    marginTop: 4,
  },
  sliderTick: {
    fontSize: 11,
    color: '#52525B',
  },

  // Counter
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    height: 56,
    paddingHorizontal: 8,
  },
  counterBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  counterValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Fee
  feeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feeInput: {
    flex: 1,
  },
  feeUnit: {
    fontSize: 15,
    color: '#A1A1AA',
    fontWeight: '500',
    minWidth: 20,
  },

  // Curriculum
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 8,
  },
  addRowBtnText: {
    fontSize: 13,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
    backgroundColor: '#27272A',
    borderRadius: 12,
    gap: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#52525B',
  },
  curriculumCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginTop: 8,
  },
  curriculumCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekBadge: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  weekBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A78BFA',
  },
  curriculumTitleInput: {
    height: 44,
    backgroundColor: '#1E1E22',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  curriculumContentInput: {
    height: 60,
    paddingTop: 10,
    paddingBottom: 10,
  },

  // Rules
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  ruleOrderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleOrderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A78BFA',
  },
  ruleInput: {
    flex: 1,
    height: 48,
    backgroundColor: '#27272A',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Preview
  previewCoverContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  previewCoverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  previewCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    gap: 12,
  },
  previewCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCategoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 4,
  },
  previewCategoryIcon: {
    fontSize: 13,
  },
  previewCategoryText: {
    fontSize: 12,
    color: '#A78BFA',
    fontWeight: '600',
  },
  previewSubcategoryText: {
    fontSize: 12,
    color: '#71717A',
  },
  previewTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 28,
  },
  previewTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewTag: {
    backgroundColor: 'rgba(139, 92, 246, 0.12)',
    borderRadius: 100,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.25)',
  },
  previewTagText: {
    fontSize: 12,
    color: '#A78BFA',
  },
  previewSection: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  previewSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewBody: {
    fontSize: 14,
    color: '#D4D4D8',
    lineHeight: 21,
  },
  previewGrid: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 4,
    gap: 2,
  },
  previewInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  previewInfoLabel: {
    flex: 1,
    fontSize: 13,
    color: '#71717A',
    fontWeight: '500',
  },
  previewInfoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  previewCurriculumRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 8,
  },
  previewCurriculumTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  previewCurriculumContent: {
    fontSize: 13,
    color: '#71717A',
    marginTop: 2,
  },
  previewRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 6,
  },

  // Buttons
  buttons: {
    paddingTop: 12,
  },
  nextBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  publishBtn: {
    backgroundColor: '#22C55E',
  },
  nextBtnDisabled: {
    backgroundColor: 'rgba(139, 92, 246, 0.35)',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Error
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
