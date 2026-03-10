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
  errorText: {
    fontSize: 16,
    color: '#A1A1AA',
  },
  backButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#27272A',
    borderRadius: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },

  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },

  // Tab Bar
  tabBar: {
    height: 48,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#71717A',
  },
  tabTextActive: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  tabIndicator: {
    width: 40,
    height: 2,
    backgroundColor: '#8B5CF6',
    borderRadius: 2,
    marginTop: 8,
  },

  // Scroll
  scrollContent: {
    flex: 1,
  },

  // Cover Image
  coverImage: {
    height: 200,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImg: {
    width: '100%',
    height: '100%',
  },

  // Info Section
  infoSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  categoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: '#8B5CF620',
  },
  categoryBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  subcategoryBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
    backgroundColor: '#3B82F620',
  },
  subcategoryBadgeText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#3B82F6',
  },
  methodBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 100,
  },
  onlineBadge: {
    backgroundColor: '#22C55E20',
  },
  offlineBadge: {
    backgroundColor: '#F59E0B20',
  },
  hybridBadge: {
    backgroundColor: '#8B5CF620',
  },
  methodBadgeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  onlineText: {
    color: '#22C55E',
  },
  offlineText: {
    color: '#F59E0B',
  },
  hybridText: {
    color: '#8B5CF6',
  },
  studyTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 32,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hostAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  hostAvatarImg: {
    width: 40,
    height: 40,
  },
  hostInfo: {
    gap: 2,
  },
  hostName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hostTemp: {
    fontSize: 12,
    color: '#A1A1AA',
  },

  // Sections
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },

  // Schedule
  scheduleCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scheduleText: {
    fontSize: 14,
    color: '#A1A1AA',
  },

  // Members
  membersCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  membersAvatars: {
    flexDirection: 'row',
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  memberAvatarMore: {
    backgroundColor: '#3F3F46',
    marginLeft: -8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarMoreText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  // Members Horizontal Row (Updated Design)
  membersListContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  memberItem: {
    alignItems: 'center',
    width: 52,
  },
  memberAvatarWrapper: {
    width: 52,
    height: 52,
    position: 'relative',
  },
  memberCircleAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  memberCircleAvatarImg: {
    width: 52,
    height: 52,
  },
  leaderBadgeOverlay: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#18181B',
  },
  memberNickname: {
    fontSize: 12,
    fontWeight: '500',
    color: '#A1A1AA',
    marginTop: 8,
    textAlign: 'center',
  },
  viewMoreLink: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8B5CF6',
  },
  // Legacy styles (kept for fallback)
  leaderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#8B5CF620',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 100,
  },
  leaderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8B5CF6',
  },
  // Leader Intro Section (New)
  leaderIntroCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
  },
  leaderIntroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  leaderIntroAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  leaderIntroAvatarImg: {
    width: 56,
    height: 56,
  },
  leaderIntroInfo: {
    flex: 1,
  },
  leaderIntroNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  leaderIntroName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  leaderIntroTemp: {
    fontSize: 13,
    color: '#A1A1AA',
    marginTop: 4,
  },
  leaderIntroBio: {
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 22,
  },
  leaderIntroNoBio: {
    fontSize: 14,
    color: '#71717A',
    fontStyle: 'italic',
  },

  // Description
  descriptionText: {
    fontSize: 15,
    color: '#A1A1AA',
    lineHeight: 24,
  },
  subSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },

  // Tags
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Curriculum
  curriculumItem: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  curriculumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  curriculumText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
    flex: 1,
  },
  curriculumContent: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  curriculumContentText: {
    fontSize: 14,
    color: '#A1A1AA',
    lineHeight: 20,
  },

  // Rules
  rulesContainer: {
    gap: 10,
  },
  rulesCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  ruleCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ruleNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ruleCardText: {
    flex: 1,
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 20,
  },
  ruleNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F59E0B15',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  ruleNoticeText: {
    flex: 1,
    fontSize: 12,
    color: '#F59E0B',
    lineHeight: 18,
  },
  ruleText: {
    fontSize: 14,
    color: '#A1A1AA',
  },

  // Fee
  feeCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feeLabel: {
    fontSize: 14,
    color: '#71717A',
  },
  feeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Deposit Card (New)
  depositCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 14,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  depositIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositInfo: {
    flex: 1,
    gap: 2,
  },
  depositLabel: {
    fontSize: 13,
    color: '#71717A',
  },
  depositValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  policyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#8B5CF610',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#8B5CF630',
  },
  policyLinkText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#8B5CF6',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    backgroundColor: '#27272A',
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3F3F46',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalBody: {
    padding: 20,
  },
  policyCard: {
    backgroundColor: '#3F3F4640',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  policyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  policyText: {
    fontSize: 15,
    color: '#E4E4E7',
    lineHeight: 24,
    textAlign: 'center',
  },
  policyNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#8B5CF615',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
  },
  policyNoticeText: {
    flex: 1,
    fontSize: 13,
    color: '#A78BFA',
    lineHeight: 18,
  },

  // Empty Tab
  emptyTab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyTabText: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 12,
  },

  // Bottom Bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#18181B',
    paddingTop: 16,
    paddingHorizontal: 24,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  joinBtn: {
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Reviews
  reviewsContainer: {
    gap: 12,
  },
  reviewCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3F3F46',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  ratingBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#3F3F46',
    borderRadius: 8,
  },
  ratingText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  reviewContent: {
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 20,
  },
  noReviewsContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  noReviewsText: {
    fontSize: 14,
    color: '#71717A',
  },
  reviewButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  writeReviewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    backgroundColor: '#8B5CF620',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8B5CF640',
  },
  writeReviewBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8B5CF6',
  },

  // Leader Actions
  leaderActionsWrapper: {
    gap: 12,
  },
  leaderActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  applicantManageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#8B5CF620',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#8B5CF640',
  },
  applicantManageBtnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 10,
  },
  leaderBtn: {
    flex: 1,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  closeBtn: {
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: '#F8717140',
  },
  closeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F87171',
  },
  completeBtn: {
    backgroundColor: '#8B5CF6',
  },
  completeBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusMessage: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    gap: 8,
  },
  statusMessageText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#71717A',
  },

  // Member Only
  memberOnlyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  memberOnlyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#8B5CF620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  memberOnlyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  memberOnlyText: {
    fontSize: 14,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  memberOnlyBtn: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  memberOnlyBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Application Status
  applicationStatusContainer: {
    gap: 8,
  },
  applicationStatusBtn: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  pendingBtn: {
    backgroundColor: '#F59E0B20',
    borderWidth: 1,
    borderColor: '#F59E0B40',
  },
  approvedBtn: {
    backgroundColor: '#22C55E20',
    borderWidth: 1,
    borderColor: '#22C55E40',
  },
  rejectedBtn: {
    backgroundColor: '#EF444420',
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  applicationStatusBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  pendingText: {
    color: '#F59E0B',
  },
  approvedText: {
    color: '#22C55E',
  },
  rejectedText: {
    color: '#EF4444',
  },
  rejectReasonText: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    paddingHorizontal: 24,
    lineHeight: 18,
  },

  // Tab Badge
  tabLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabBadge: {
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  tabBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Applicants Tab
  applicantsContainer: {
    padding: 16,
    gap: 16,
  },
  emptyApplicants: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 16,
  },
  emptyApplicantsText: {
    fontSize: 15,
    color: '#71717A',
  },
  applicantCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  applicantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  applicantAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B5CF620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  applicantInfo: {
    flex: 1,
    gap: 4,
  },
  applicantName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  applicantDate: {
    fontSize: 13,
    color: '#71717A',
  },
  applicantMessageContainer: {
    backgroundColor: '#3F3F4640',
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  applicantMessageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8B5CF6',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  applicantMessage: {
    fontSize: 15,
    color: '#E4E4E7',
    lineHeight: 24,
  },
  applicantActions: {
    flexDirection: 'row',
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF444440',
  },
  rejectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  approveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 48,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  approveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
