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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerBackBtn: {
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
  headerSpacer: {
    width: 40,
  },

  // Tabs
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#27272A',
  },
  tabActive: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  tabTextActive: {
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // List
  scrollContent: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    color: '#71717A',
  },

  // Applicant Card
  applicantCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardAvatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: '#71717A',
  },
  cardChevron: {
    padding: 4,
  },

  // Card Preview Section
  cardPreviewSection: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  cardPreviewBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cardPreviewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  cardPreviewText: {
    fontSize: 14,
    color: '#D4D4D8',
    lineHeight: 20,
  },

  // Card Status
  cardStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardStatusBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardStatusSection: {
    gap: 6,
  },
  cardRejectReasonText: {
    fontSize: 12,
    color: '#71717A',
    marginLeft: 20,
  },

  // Legacy Card Content
  cardContent: {
    gap: 12,
  },
  messageText: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  viewMoreText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },

  // Card Buttons
  cardButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    backgroundColor: '#3F3F46',
    borderRadius: 8,
  },
  rejectBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F87171',
  },
  approveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    backgroundColor: '#8B5CF6',
    borderRadius: 8,
  },
  approveBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Status Badge
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  rejectReasonText: {
    fontSize: 12,
    color: '#71717A',
    width: '100%',
    marginTop: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 100,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3F3F46',
    borderRadius: 10,
  },
  modalCancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  modalConfirmBtn: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F87171',
    borderRadius: 10,
  },
  modalConfirmBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Detail Modal - Improved UI
  detailModalContent: {
    backgroundColor: '#1F1F23',
    borderRadius: 24,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  detailModalHeader: {
    alignItems: 'flex-end',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  detailModalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailModalBody: {
    paddingHorizontal: 24,
  },
  detailModalBodyContent: {
    paddingBottom: 40,
  },
  detailProfileSection: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  detailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
  },
  detailNickname: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  detailMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  detailMetaText: {
    fontSize: 13,
    color: '#71717A',
  },
  detailStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  detailStatusPending: {
    backgroundColor: '#F59E0B20',
  },
  detailStatusApproved: {
    backgroundColor: '#22C55E20',
  },
  detailStatusRejected: {
    backgroundColor: '#EF444420',
  },
  detailStatusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  detailSectionsContainer: {
    marginTop: 24,
    gap: 20,
  },
  detailQuestionSection: {
    gap: 10,
  },
  detailQuestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailQuestionBadge: {
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailQuestionBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  detailAnswerCard: {
    backgroundColor: '#27272A',
    borderRadius: 14,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#3F3F46',
  },
  detailAnswerText: {
    fontSize: 15,
    color: '#E4E4E7',
    lineHeight: 24,
  },
  detailEmptyMessage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  detailEmptyMessageText: {
    fontSize: 14,
    color: '#71717A',
  },
  detailRejectBadge: {
    backgroundColor: '#F8717120',
  },
  detailMessageSection: {
    marginTop: 8,
  },
  detailSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717A',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailMessageCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3F3F46',
  },
  detailMessageText: {
    fontSize: 15,
    color: '#E4E4E7',
    lineHeight: 24,
  },
  detailRejectSection: {
    marginTop: 20,
  },
  detailRejectCard: {
    backgroundColor: '#EF444410',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EF444430',
  },
  detailRejectText: {
    fontSize: 14,
    color: '#FCA5A5',
    lineHeight: 22,
  },
  detailActionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 8,
  },
  detailRejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: '#27272A',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F8717130',
  },
  detailRejectBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F87171',
  },
  detailApproveBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 52,
    backgroundColor: '#8B5CF6',
    borderRadius: 14,
  },
  detailApproveBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Legacy Detail Modal (keeping for compatibility)
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  detailInfo: {
    flex: 1,
    gap: 4,
  },
  detailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailDate: {
    fontSize: 13,
    color: '#71717A',
  },
  detailContent: {
    backgroundColor: '#3F3F4620',
    borderRadius: 12,
    padding: 16,
  },
  detailMessage: {
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 22,
  },
});
