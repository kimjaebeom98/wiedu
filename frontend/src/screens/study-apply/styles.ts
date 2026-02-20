import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#18181B',
  },
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
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flex: 1,
  },
  studyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#27272A20',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  studyThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#8B5CF640',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studyText: {
    flex: 1,
  },
  studyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  studyMeta: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  formContent: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 20,
  },
  inputSection: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  required: {
    fontSize: 15,
    fontWeight: '600',
    color: '#EF4444',
  },
  textInput: {
    backgroundColor: '#27272A',
    borderRadius: 12,
    padding: 16,
    height: 100,
    color: '#FFFFFF',
    fontSize: 14,
  },
  textInputSmall: {
    height: 80,
  },
  agreeSection: {
    gap: 12,
    marginTop: 8,
  },
  agreeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#27272A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#8B5CF6',
  },
  agreeText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#A1A1AA',
  },
  agreeTextChecked: {
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    backgroundColor: '#18181B',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  detailLink: {
    color: '#8B5CF6',
    fontSize: 13,
    textDecorationLine: 'underline',
  },
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
    maxHeight: '70%',
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
  ruleText: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  policyText: {
    color: '#E4E4E7',
    fontSize: 14,
    lineHeight: 22,
  },
});
