import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { COLORS } from '../constants/theme';

const PAYMENT_METHODS = [
  { id: 'paypal', label: 'PayPal', icon: '💳', fields: ['email'] },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦', fields: ['accountNumber', 'ifsc', 'accountName'] },
  { id: 'upi', label: 'UPI', icon: '📱', fields: ['upiId'] },
];

const FIELD_LABELS = {
  email: 'PayPal Email',
  accountNumber: 'Account Number',
  ifsc: 'IFSC Code',
  accountName: 'Account Holder Name',
  upiId: 'UPI ID (e.g. user@paytm)',
};

export default function WithdrawalScreen({ navigation }) {
  const { coinCount, coinsToCurrency } = useGame();
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [formData, setFormData] = useState({});

  const currencyAmount = coinsToCurrency(coinCount);

  const handleFieldChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWithdraw = () => {
    if (!selectedMethod) {
      Alert.alert('Select Method', 'Please select a payment method.');
      return;
    }

    const method = PAYMENT_METHODS.find((m) => m.id === selectedMethod);
    const missing = method.fields.filter((f) => !formData[f]?.trim());
    if (missing.length > 0) {
      Alert.alert('Missing Info', `Please fill: ${missing.map((f) => FIELD_LABELS[f]).join(', ')}`);
      return;
    }

    if (coinCount < 1000) {
      Alert.alert('Minimum', 'Minimum withdrawal is 1000 coins ($1).');
      return;
    }

    Alert.alert(
      'Withdrawal Request',
      `Your request for $${currencyAmount} has been submitted. Payment will be processed within 24-48 hours.`
    );
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Withdrawal</Text>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.coinBalance}>{coinCount.toLocaleString()} Coins</Text>
          <Text style={styles.currencyBalance}>≈ ${currencyAmount}</Text>
          <Text style={styles.rateNote}>$1 = 1000 Coins</Text>
        </View>

        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.methodList}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.methodOption,
                selectedMethod === method.id && styles.methodOptionSelected,
              ]}
              onPress={() => setSelectedMethod(method.id)}
            >
              <Text style={styles.methodIcon}>{method.icon}</Text>
              <Text style={styles.methodLabel}>{method.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedMethod && (
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>Enter Details</Text>
            {PAYMENT_METHODS.find((m) => m.id === selectedMethod).fields.map((field) => (
              <View key={field} style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{FIELD_LABELS[field]}</Text>
                <TextInput
                  style={styles.input}
                  value={formData[field] || ''}
                  onChangeText={(v) => handleFieldChange(field, v)}
                  placeholder={FIELD_LABELS[field]}
                  placeholderTextColor={COLORS.textSecondary}
                  keyboardType={field === 'email' ? 'email-address' : 'default'}
                  autoCapitalize="none"
                />
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity style={styles.withdrawButton} onPress={handleWithdraw}>
          <Text style={styles.withdrawButtonText}>Request Withdrawal</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
    marginBottom: 20,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: COLORS.backgroundLight,
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.gold,
    marginBottom: 24,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  coinBalance: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.gold,
  },
  currencyBalance: {
    fontSize: 20,
    color: COLORS.text,
    marginTop: 4,
  },
  rateNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  methodList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.card,
    gap: 8,
  },
  methodOptionSelected: {
    borderColor: COLORS.gold,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
  },
  methodIcon: {
    fontSize: 24,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  formSection: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.card,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: COLORS.text,
  },
  withdrawButton: {
    backgroundColor: COLORS.gold,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  withdrawButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.background,
    textAlign: 'center',
  },
  backButton: {
    padding: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
});
