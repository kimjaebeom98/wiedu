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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
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

  // Rules
  rulesCard: {
    backgroundColor: '#27272A',
    borderRadius: 16,
    padding: 16,
    gap: 10,
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
    height: 100,
    backgroundColor: '#18181B',
    paddingTop: 16,
    paddingHorizontal: 24,
    paddingBottom: 32,
    justifyContent: 'center',
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
});
