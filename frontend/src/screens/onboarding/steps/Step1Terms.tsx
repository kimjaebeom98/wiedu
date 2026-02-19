import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StepProps } from '../types';
import { styles } from '../styles';

export default function Step1Terms({ data, updateData }: StepProps) {
  const allRequired = data.termsAgreed && data.privacyAgreed;
  const allAgreed = allRequired && data.marketingAgreed;

  const handleToggleAll = () => {
    const newVal = !allAgreed;
    updateData('termsAgreed', newVal);
    updateData('privacyAgreed', newVal);
    updateData('marketingAgreed', newVal);
  };

  return (
    <View>
      {/* Toggle all */}
      <TouchableOpacity style={styles.termsAllRow} onPress={handleToggleAll}>
        <View style={[styles.checkbox, allAgreed && styles.checkboxChecked]}>
          {allAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <Text style={styles.termsAllText}>전체 동의</Text>
      </TouchableOpacity>

      {/* Service terms (required) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('termsAgreed', !data.termsAgreed)}
      >
        <View style={[styles.checkbox, data.termsAgreed && styles.checkboxChecked]}>
          {data.termsAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsRequiredBadge}>[필수]</Text>
          <Text style={styles.termsText}>서비스 이용약관 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>

      {/* Privacy (required) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('privacyAgreed', !data.privacyAgreed)}
      >
        <View style={[styles.checkbox, data.privacyAgreed && styles.checkboxChecked]}>
          {data.privacyAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsRequiredBadge}>[필수]</Text>
          <Text style={styles.termsText}>개인정보 처리방침 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>

      {/* Marketing (optional) */}
      <TouchableOpacity
        style={styles.termsRow}
        onPress={() => updateData('marketingAgreed', !data.marketingAgreed)}
      >
        <View style={[styles.checkbox, data.marketingAgreed && styles.checkboxChecked]}>
          {data.marketingAgreed && <Feather name="check" size={14} color="#FFFFFF" />}
        </View>
        <View style={styles.termsLabelRow}>
          <Text style={styles.termsOptionalBadge}>[선택]</Text>
          <Text style={styles.termsText}>마케팅 수신 동의</Text>
        </View>
        <Feather name="chevron-right" size={18} color="#52525B" />
      </TouchableOpacity>
    </View>
  );
}
