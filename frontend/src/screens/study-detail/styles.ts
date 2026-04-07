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
    maxHeight: 48,
    flexGrow: 0,
    backgroundColor: '#18181B',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 8,
    gap: 4,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    overflow: 'visible',
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

  // Deposit Card (Compact)
  depositCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  depositHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  depositIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#22C55E20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  depositInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  depositLabel: {
    fontSize: 14,
    color: '#A1A1AA',
  },
  depositValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#22C55E',
  },
  policyLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#3F3F46',
  },
  policyLinkText: {
    flex: 1,
    fontSize: 12,
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
  writeReviewBtnDisabled: {
    backgroundColor: '#27272A',
    borderColor: '#3F3F46',
  },
  writeReviewBtnTextDisabled: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717A',
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
  statusCompletedText: {
    color: '#22C55E',
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
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'visible',
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -16,
    backgroundColor: '#EF4444',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontSize: 10,
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

  // Common
  flexOne: {
    flex: 1,
  },
  bottomSpacer: {
    height: 200,
  },

  // Curriculum
  sessionCountText: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  curriculumLoadingIndicator: {
    marginVertical: 12,
  },
  accessDeniedContainer: {
    backgroundColor: '#3F3F4620',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  accessDeniedIcon: {
    marginBottom: 8,
  },
  accessDeniedText: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
  },

  // Session
  sessionCard: {
    backgroundColor: '#1F1F23',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sessionModeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  sessionModeIconOnline: {
    backgroundColor: '#22C55E20',
  },
  sessionModeIconOffline: {
    backgroundColor: '#F59E0B20',
  },
  sessionTitleText: {
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sessionModeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionModeBadgeOnline: {
    backgroundColor: '#22C55E20',
  },
  sessionModeBadgeOffline: {
    backgroundColor: '#F59E0B20',
  },
  sessionModeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sessionModeBadgeTextOnline: {
    color: '#22C55E',
  },
  sessionModeBadgeTextOffline: {
    color: '#F59E0B',
  },
  sessionInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sessionInfoIcon: {
    marginRight: 6,
  },
  sessionInfoText: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  sessionContentContainer: {
    marginBottom: 6,
  },
  sessionContentText: {
    fontSize: 13,
    color: '#E4E4E7',
    lineHeight: 20,
  },
  meetingLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E10',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  meetingLinkIcon: {
    marginRight: 8,
  },
  meetingLinkText: {
    fontSize: 13,
    color: '#22C55E',
    flex: 1,
  },
  meetingLinkCopyIcon: {
    marginLeft: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F59E0B10',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  locationIcon: {
    marginRight: 8,
  },
  locationPlaceName: {
    fontSize: 13,
    color: '#F59E0B',
    fontWeight: '600',
  },
  locationAddress: {
    fontSize: 12,
    color: '#F59E0B',
    opacity: 0.8,
  },
  locationExternalIcon: {
    marginLeft: 8,
  },
  noSessionsText: {
    fontSize: 13,
    color: '#71717A',
    textAlign: 'center',
    paddingVertical: 8,
  },

  // Withdrawal (Leader)
  withdrawalRequestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27272A',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  withdrawalRequestBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 8,
  },
  btnIconRight: {
    marginRight: 8,
  },
  withdrawalCancelBtn: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  withdrawalCancelBtnText: {
    fontSize: 14,
    color: '#71717A',
  },

  // Rejected Application
  rejectedInfoContainer: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  rejectedInfoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rejectedInfoIcon: {
    marginRight: 6,
  },
  rejectedInfoText: {
    fontSize: 13,
    color: '#71717A',
  },
  rejectReasonDetail: {
    fontSize: 12,
    color: '#52525B',
    marginLeft: 20,
  },
  cooldownText: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    marginTop: 4,
  },

  // Withdrawal Modal
  modalPadding: {
    padding: 16,
  },
  withdrawalReasonInput: {
    backgroundColor: '#3F3F46',
    borderRadius: 12,
    padding: 14,
    color: '#FFFFFF',
    fontSize: 15,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCountText: {
    color: '#71717A',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'right',
  },
  depositWarningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EF444420',
    borderRadius: 10,
    padding: 12,
    marginTop: 12,
    gap: 8,
  },
  depositWarningIcon: {
    marginTop: 2,
  },
  depositWarningText: {
    flex: 1,
    fontSize: 13,
    color: '#EF4444',
    lineHeight: 18,
  },
  submitWithdrawalBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  submitWithdrawalBtnActive: {
    backgroundColor: '#EF4444',
  },
  submitWithdrawalBtnDisabled: {
    backgroundColor: '#3F3F46',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },

  // Withdrawal List Modal
  modalScrollView: {
    maxHeight: 400,
  },
  emptyWithdrawalContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyWithdrawalText: {
    fontSize: 14,
    color: '#71717A',
    marginTop: 12,
  },
  withdrawalListContainer: {
    padding: 16,
    gap: 12,
  },
  withdrawalRequestCard: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 14,
  },
  withdrawalUserInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  withdrawalUserAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  withdrawalUserAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#8B5CF630',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  withdrawalUserName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  withdrawalRequestDate: {
    fontSize: 12,
    color: '#71717A',
    marginTop: 2,
  },
  withdrawalReasonContainer: {
    backgroundColor: '#18181B',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  withdrawalReasonLabel: {
    fontSize: 12,
    color: '#71717A',
    marginBottom: 4,
  },
  withdrawalReasonText: {
    fontSize: 14,
    color: '#E4E4E7',
    lineHeight: 20,
  },
  approveWithdrawalBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  approveWithdrawalBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
